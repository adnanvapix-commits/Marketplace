import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPooledAdminClient as createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const db = createAdminClient();
  const { data: p } = await db.from("users").select("role, email").eq("id", user.id).single();
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  return (p?.role === "admin" || p?.email === adminEmail) ? user : null;
}

// POST — bulk action on multiple users
// actions: bulk_verify | bulk_unverify | bulk_activate_sub | bulk_deactivate_sub | bulk_suspend | bulk_unsuspend
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userIds, action } = await req.json();

  const validActions = ["bulk_verify", "bulk_unverify", "bulk_activate_sub", "bulk_deactivate_sub", "bulk_suspend", "bulk_unsuspend"];
  if (!Array.isArray(userIds) || userIds.length === 0)
    return NextResponse.json({ error: "userIds array required" }, { status: 400 });
  if (!validActions.includes(action))
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  if (userIds.length > 100)
    return NextResponse.json({ error: "Max 100 users per bulk action" }, { status: 400 });

  const db = createAdminClient();
  let updates: Record<string, unknown> = {};
  let notifType: string | null = null;
  let notifTitle = "";
  let notifMessage = "";

  switch (action) {
    case "bulk_verify":
      updates = { is_verified: true, verification_status: "approved" };
      notifType = "verification_approved";
      notifTitle = "✅ Account Verified!";
      notifMessage = "Your account has been verified. You can now subscribe and access the marketplace.";
      break;
    case "bulk_unverify":
      updates = { is_verified: false, verification_status: "pending" };
      break;
    case "bulk_activate_sub": {
      const expiry = new Date(Date.now() + 90 * 86400000).toISOString(); // +3 months
      updates = { is_subscribed: true, subscription_expiry: expiry, subscription_tier: "beginner" };
      break;
    }
    case "bulk_deactivate_sub":
      updates = { is_subscribed: false, subscription_expiry: null };
      break;
    case "bulk_suspend":
      updates = { is_blocked: true };
      break;
    case "bulk_unsuspend":
      updates = { is_blocked: false };
      break;
  }

  const { error } = await db.from("users").update(updates).in("id", userIds);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send notifications if applicable
  if (notifType && notifTitle) {
    const notifs = userIds.map((userId: string) => ({
      user_id: userId, type: notifType, title: notifTitle, message: notifMessage,
    }));
    void db.from("notifications").insert(notifs);
  }

  // Log to admin_logs
  void db.from("admin_logs").insert({
    admin_id: admin.id,
    action,
    details: `Bulk action on ${userIds.length} users`,
  });

  return NextResponse.json({ success: true, affected: userIds.length });
}
