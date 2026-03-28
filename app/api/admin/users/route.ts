import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Verify caller is admin
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createAdminClient();
  const { data: profile } = await db.from("users").select("role, email").eq("id", user.id).single();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  const isAdmin = profile?.role === "admin" || profile?.email === adminEmail;
  return isAdmin ? user : null;
}

// PATCH /api/admin/users — update subscription or block status
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userId, is_subscribed, subscription_expiry, is_blocked } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const db = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (is_subscribed !== undefined) updates.is_subscribed = is_subscribed;
  if (subscription_expiry !== undefined) updates.subscription_expiry = subscription_expiry;
  if (is_blocked !== undefined) updates.is_blocked = is_blocked;

  const { error } = await db.from("users").update(updates).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log the action
  await db.from("admin_logs").insert({
    admin_id: admin.id,
    action: is_blocked !== undefined
      ? (is_blocked ? "block_user" : "unblock_user")
      : (is_subscribed ? "activate_subscription" : "deactivate_subscription"),
    target_user_id: userId,
    details: { subscription_expiry, is_subscribed, is_blocked },
  });

  return NextResponse.json({ success: true });
}
