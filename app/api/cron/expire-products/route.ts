import { NextRequest, NextResponse } from "next/server";
import { createPooledAdminClient as createAdminClient } from "@/lib/supabase/admin";

// Called by Vercel Cron daily at 2am UTC
// Protected by CRON_SECRET to prevent unauthorized calls
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = createAdminClient();

    // Use the RPC function — runs as a single optimized SQL UPDATE
    // Much lighter on Disk IO than a full table scan + JS-side UPDATE
    const { error } = await db.rpc("deactivate_expired_products");
    if (error) throw new Error(error.message);

    // Count how many were deactivated (lightweight HEAD query)
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // last 1 hour
    const { data: recentlyDeactivated } = await db
      .from("products")
      .select("id, title, user_id")
      .eq("is_active", false)
      .gte("updated_at", since)
      .limit(100); // cap — don't scan the whole table

    const deactivated = recentlyDeactivated?.length ?? 0;

    // Notify sellers — only if there are any, to avoid empty inserts
    if (deactivated > 0 && recentlyDeactivated) {
      const notifs = recentlyDeactivated.map(p => ({
        user_id: p.user_id,
        type: "ticket_reply",
        title: "📦 Listing Expired",
        message: `Your listing "${p.title}" has been deactivated after 90 days. Re-post it from your profile to make it active again.`,
      }));
      void db.from("notifications").insert(notifs);
    }

    return NextResponse.json({ deactivated, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// Allow Vercel cron to call via GET too
export async function GET(req: NextRequest) {
  return POST(req);
}
