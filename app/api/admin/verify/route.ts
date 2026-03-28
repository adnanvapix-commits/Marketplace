import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const db = createAdminClient();
  const { data: p } = await db.from("users").select("role, email").eq("id", user.id).single();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  return (p?.role === "admin" || p?.email === adminEmail) ? user : null;
}

// PATCH — approve or reject user verification
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userId, action } = await req.json(); // action: 'approve' | 'reject'
  if (!userId || !action) return NextResponse.json({ error: "userId and action required" }, { status: 400 });

  const db = createAdminClient();
  const updates =
    action === "approve"
      ? { is_verified: true, verification_status: "approved" }
      : { is_verified: false, verification_status: "rejected" };

  const { error } = await db.from("users").update(updates).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("admin_logs").insert({
    admin_id: admin.id,
    action: action === "approve" ? "verify_user" : "reject_user",
    target_user_id: userId,
  });

  return NextResponse.json({ success: true });
}
