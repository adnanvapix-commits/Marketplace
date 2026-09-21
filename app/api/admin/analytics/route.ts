import { NextResponse } from "next/server";
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

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createAdminClient();

  // Get last 30 days of signups grouped by date
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [signupsRes, subsRes, tiersRes, topProductsRes] = await Promise.all([
    // Daily signups for last 30 days
    db.from("users")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true }),

    // Subscription breakdown
    db.from("users")
      .select("is_subscribed, subscription_tier, subscription_expiry"),

    // Tier counts
    db.from("users")
      .select("subscription_tier")
      .not("subscription_tier", "is", null)
      .eq("is_subscribed", true),

    // Top 5 most viewed products
    db.from("products")
      .select("id, title, view_count, category")
      .eq("is_active", true)
      .order("view_count", { ascending: false })
      .limit(5),
  ]);

  // Group signups by day
  const signupsByDay: Record<string, number> = {};
  (signupsRes.data ?? []).forEach(u => {
    const day = u.created_at.slice(0, 10); // YYYY-MM-DD
    signupsByDay[day] = (signupsByDay[day] ?? 0) + 1;
  });

  // Fill missing days with 0
  const signupChart = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    signupChart.push({ date: key, count: signupsByDay[key] ?? 0 });
  }

  // Subscription stats
  const allSubs = subsRes.data ?? [];
  const now = new Date();
  const active   = allSubs.filter(u => u.is_subscribed && (!u.subscription_expiry || new Date(u.subscription_expiry) > now)).length;
  const expired  = allSubs.filter(u => u.is_subscribed && u.subscription_expiry && new Date(u.subscription_expiry) <= now).length;
  const inactive = allSubs.filter(u => !u.is_subscribed).length;

  // Tier breakdown
  const tiers: Record<string, number> = { elite: 0, expert: 0, beginner: 0 };
  (tiersRes.data ?? []).forEach(u => {
    if (u.subscription_tier && tiers[u.subscription_tier] !== undefined) {
      tiers[u.subscription_tier]++;
    }
  });

  return NextResponse.json({
    signupChart,
    subscriptions: { active, expired, inactive },
    tiers,
    topProducts: topProductsRes.data ?? [],
  });
}
