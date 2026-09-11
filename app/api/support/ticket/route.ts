import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST — submit a new ticket
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category, subject, message } = await req.json();
  if (!category || !subject?.trim() || !message?.trim())
    return NextResponse.json({ error: "All fields required" }, { status: 400 });

  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    user_email: user.email,
    category,
    subject: subject.trim(),
    message: message.trim(),
    status: "open",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// GET — admin: list all tickets with optional status filter
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meta = user.user_metadata ?? {};
  const isAdmin = meta.role === "admin" || user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createAdminClient();
  const status = req.nextUrl.searchParams.get("status") || "all";

  let query = db.from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tickets: data });
}

// PATCH — admin: update ticket status or reply
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meta = user.user_metadata ?? {};
  const isAdmin = meta.role === "admin" || user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ticketId, status, admin_reply } = await req.json();
  if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from("support_tickets")
    .update({ status, admin_reply, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
