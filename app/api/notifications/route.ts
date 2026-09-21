import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — fetch notifications for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return NextResponse.json({ notifications: data ?? [] });
}

// PATCH — mark notifications as read
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();
  if (!ids) return NextResponse.json({ error: "ids required" }, { status: 400 });

  const base = supabase.from("notifications").update({ read: true }).eq("user_id", user.id);
  const { error } = Array.isArray(ids) ? await base.in("id", ids) : await base;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — permanently delete notifications (user can only delete their own)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json(); // array of IDs, or "all"
  if (!ids) return NextResponse.json({ error: "ids required" }, { status: 400 });

  // Always scope to user_id so users can never delete other users' notifications
  const base = supabase.from("notifications").delete().eq("user_id", user.id);
  const { error } = Array.isArray(ids) ? await base.in("id", ids) : await base;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// POST — admin: send notification to a specific user
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  const { data: profile } = await db.from("users").select("role, email").eq("id", user.id).single();
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  if (profile?.role !== "admin" && profile?.email !== adminEmail)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, type, title, message } = await req.json();
  if (!userId || !type || !title || !message)
    return NextResponse.json({ error: "userId, type, title, message required" }, { status: 400 });

  const { error } = await db.from("notifications").insert({ user_id: userId, type, title, message });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
