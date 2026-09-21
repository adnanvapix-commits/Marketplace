import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_CATEGORIES = ["subscription", "account", "product", "payment", "verification", "technical", "other"];
const VALID_STATUSES   = ["open", "in_progress", "resolved", "closed"];

// Shared: verify admin via DB (not user_metadata — that is user-writable)
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const db = createAdminClient();
  const { data: profile } = await db.from("users").select("role, email").eq("id", user.id).single();
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  return (profile?.role === "admin" || profile?.email === adminEmail) ? user : null;
}

// POST — submit a new ticket (any authenticated user)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category, subject, message } = await req.json();

  // Validate category against allowlist
  if (!category || !VALID_CATEGORIES.includes(category))
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  if (!subject?.trim() || subject.trim().length > 120)
    return NextResponse.json({ error: "Subject required (max 120 chars)" }, { status: 400 });
  if (!message?.trim() || message.trim().length > 5000)
    return NextResponse.json({ error: "Message required (max 5000 chars)" }, { status: 400 });

  const { error } = await supabase.from("support_tickets").insert({
    user_id:    user.id,
    user_email: user.email,
    category,
    subject: subject.trim(),
    message: message.trim(),
    status: "open",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// GET — admin: list tickets (DB-verified admin check)
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createAdminClient();
  const status = req.nextUrl.searchParams.get("status") || "all";

  let query = db.from("support_tickets").select("*").order("created_at", { ascending: false });
  if (status !== "all" && VALID_STATUSES.includes(status)) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tickets: data });
}

// PATCH — admin: update ticket status/reply (DB-verified admin check)
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ticketId, status, admin_reply } = await req.json();
  if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });
  if (status && !VALID_STATUSES.includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from("support_tickets")
    .update({ status, admin_reply, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
