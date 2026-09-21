import { createAdminClient } from "@/lib/supabase/admin";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const db = createAdminClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const now = new Date();

  const [signupsRes, allUsersRes, tiersRes, topProductsRes, productsCountRes] = await Promise.all([
    db.from("users").select("created_at").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }),
    db.from("users").select("is_subscribed, subscription_tier, subscription_expiry"),
    db.from("users").select("subscription_tier").not("subscription_tier", "is", null).eq("is_subscribed", true),
    db.from("products").select("id, title, view_count, category").eq("is_active", true).order("view_count", { ascending: false }).limit(5),
    db.from("products").select("id", { count: "exact", head: true }),
  ]);

  // Group signups by day (last 30 days)
  const signupsByDay: Record<string, number> = {};
  (signupsRes.data ?? []).forEach(u => {
    const day = u.created_at.slice(0, 10);
    signupsByDay[day] = (signupsByDay[day] ?? 0) + 1;
  });
  const signupChart = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: signupsByDay[key] ?? 0, label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) };
  });

  const allSubs = allUsersRes.data ?? [];
  const subStats = {
    active:   allSubs.filter(u => u.is_subscribed && (!u.subscription_expiry || new Date(u.subscription_expiry) > now)).length,
    expired:  allSubs.filter(u => u.is_subscribed && u.subscription_expiry && new Date(u.subscription_expiry) <= now).length,
    inactive: allSubs.filter(u => !u.is_subscribed).length,
  };

  const tiers: Record<string, number> = { elite: 0, expert: 0, beginner: 0 };
  (tiersRes.data ?? []).forEach(u => {
    if (u.subscription_tier && tiers[u.subscription_tier] !== undefined) tiers[u.subscription_tier]++;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Last 30 days overview</p>
      </div>
      <AnalyticsClient
        signupChart={signupChart}
        subStats={subStats}
        tiers={tiers}
        topProducts={topProductsRes.data ?? []}
        totalProducts={productsCountRes.count ?? 0}
        totalUsers={allSubs.length}
      />
    </div>
  );
}
