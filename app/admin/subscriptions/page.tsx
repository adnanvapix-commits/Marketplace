import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import SubscriptionsTable from "./SubscriptionsTable";
import type { AdminUser } from "@/lib/services/adminService";
import Link from "next/link";

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = createAdminClient();

  // Try with subscription_tier first; fall back gracefully if column doesn't exist yet
  let data: AdminUser[] | null = null;
  let needsMigration = false;

  const { data: withTier, error: tierError } = await db
    .from("users")
    .select("id, email, role, is_verified, verification_status, is_subscribed, subscription_expiry, subscription_tier, is_blocked, created_at")
    .order("is_subscribed", { ascending: false });

  if (tierError?.message?.includes("subscription_tier")) {
    // Column doesn't exist yet — fetch without it
    needsMigration = true;
    const { data: withoutTier } = await db
      .from("users")
      .select("id, email, role, is_verified, verification_status, is_subscribed, subscription_expiry, is_blocked, created_at")
      .order("is_subscribed", { ascending: false });
    // Add null tier to each row so the component type is satisfied
    data = (withoutTier ?? []).map((u) => ({ ...u, subscription_tier: null })) as AdminUser[];
  } else {
    data = (withTier ?? []) as AdminUser[];
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Subscription Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          {data?.filter((u) => u.is_subscribed).length ?? 0} active subscriptions
        </p>
      </div>

      {/* Migration banner */}
      {needsMigration && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Database migration required</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Run <code className="bg-amber-100 px-1 rounded font-mono">supabase/subscription_tiers_migration.sql</code> in your Supabase SQL Editor to enable tier features.
            </p>
          </div>
          <Link
            href="https://supabase.com/dashboard"
            target="_blank"
            className="text-xs font-semibold text-amber-800 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap"
          >
            Open Supabase →
          </Link>
        </div>
      )}

      <SubscriptionsTable
        initialUsers={data ?? []}
        adminId={user?.id ?? ""}
        tierEnabled={!needsMigration}
      />
    </div>
  );
}
