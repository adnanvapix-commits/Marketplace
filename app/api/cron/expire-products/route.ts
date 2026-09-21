import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Called by Vercel Cron or an external scheduler to auto-deactivate expired products
// Protected by a secret token to prevent unauthorized calls
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  // If CRON_SECRET is set, require it; otherwise allow (for dev environments)
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = createAdminClient();

    // Deactivate products that have passed their expiry date
    const { data, error } = await db
      .from("products")
      .update({ is_active: false })
      .eq("is_active", true)
      .lt("expires_at", new Date().toISOString())
      .select("id, title, user_id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const deactivated = data?.length ?? 0;

    // Notify sellers whose products were deactivated
    if (deactivated > 0 && data) {
      const notifs = data.map(p => ({
        user_id: p.user_id,
        type: "ticket_reply", // reuse closest type
        title: "📦 Listing Expired",
        message: `Your listing "${p.title}" has been deactivated after 90 days. Re-post it from your dashboard to make it active again.`,
      }));
  void db.from("notifications").insert(notifs);
    }

    return NextResponse.json({ deactivated, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// GET — allow Vercel cron to call via GET too
export async function GET(req: NextRequest) {
  return POST(req);
}
