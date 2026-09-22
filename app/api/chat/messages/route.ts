import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMarketplaceAccess } from "@/lib/supabase/accessCheck";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  // Require verified + active subscription
  const access = await requireMarketplaceAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const { userId } = access;
  const { searchParams } = req.nextUrl;
  const productId   = searchParams.get("productId");
  const otherUserId = searchParams.get("otherUserId");

  if (!productId || !otherUserId)
    return NextResponse.json({ error: "productId and otherUserId required" }, { status: 400 });

  if (!UUID_REGEX.test(productId) || !UUID_REGEX.test(otherUserId))
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

  const db = createAdminClient();
  const { data, error } = await db
    .from("messages")
    .select("*")
    .eq("product_id", productId)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),` +
      `and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark messages sent to this user as read (fire-and-forget, non-blocking)
  void db.from("messages")
    .update({ is_read: true })
    .eq("receiver_id", userId)
    .eq("product_id", productId)
    .eq("sender_id", otherUserId)
    .eq("is_read", false);

  return NextResponse.json({ messages: data ?? [] });
}
