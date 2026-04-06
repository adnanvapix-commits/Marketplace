import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const productId = searchParams.get("productId");
  const otherUserId = searchParams.get("otherUserId");

  if (!productId || !otherUserId) {
    return NextResponse.json({ error: "productId and otherUserId required" }, { status: 400 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("messages")
    .select("*")
    .eq("product_id", productId)
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` +
      `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data ?? [] });
}
