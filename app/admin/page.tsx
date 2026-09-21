import { createAdminClient } from "@/lib/supabase/admin";
import { Users, ShoppingBag, MessageCircle, CreditCard, TrendingUp, ArrowRight, Eye, Crown, Star, Award, TicketCheck, UserCheck, Clock } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/formatDate";

// Revalidate every 30 seconds — cached at CDN, much faster than force-dynamic
export const revalidate = 30;

export default async function AdminDashboard() {
  const db = createAdminClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString();

  // Batch 1: counts only (head queries = minimal data transfer)
  const [usersRes, productsRes, newUsersRes, openTicketsRes, activeSubsRes, expiredSubsRes] = await Promise.all([
    db.from("users").select("id", { count: "exact", head: true }),
    db.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    db.from("users").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    db.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("users").select("id", { count: "exact", head: true }).eq("is_subscribed", true).or(`subscription_expiry.is.null,subscription_expiry.gt.${now.toISOString()}`),
    db.from("users").select("id", { count: "exact", head: true }).eq("is_subscribed", true).lt("subscription_expiry", now.toISOString()),
  ]);

  // Batch 2: data queries (run after counts so connection load is spread)
  const [conversationsRes, pendingRes, expiringRes, topProductsRes] = await Promise.all([
    db.rpc("count_conversations"),
    db.from("users").select("id, email, full_name, company_name, created_at").eq("verification_status", "pending").eq("is_verified", false).order("created_at", { ascending: false }).limit(5),
    db.from("users").select("id, email, company_name, subscription_expiry, subscription_tier").eq("is_subscribed", true).lte("subscription_expiry", sevenDaysFromNow).gt("subscription_expiry", now.toISOString()).order("subscription_expiry", { ascending: true }).limit(5),
    db.from("products").select("id, title, view_count, category").eq("is_active", true).order("view_count", { ascending: false }).limit(5),
  ]);

  const activeSubs  = activeSubsRes.count ?? 0;
  const expiredSubs = expiredSubsRes.count ?? 0;

  // Tier counts: single query, compute in JS
  const { data: tierData } = await db.from("users").select("subscription_tier").eq("is_subscribed", true).not("subscription_tier", "is", null);
  const tiers = { elite: 0, expert: 0, beginner: 0 } as Record<string, number>;
  (tierData ?? []).forEach(u => { if (u.subscription_tier) tiers[u.subscription_tier] = (tiers[u.subscription_tier] ?? 0) + 1; });

  const statCards = [
    { label: "Total Users",     value: usersRes.count ?? 0,         icon: Users,         color: "bg-blue-50 text-blue-600",     href: "/admin/users" },
    { label: "New (30d)",       value: newUsersRes.count ?? 0,      icon: UserCheck,     color: "bg-indigo-50 text-indigo-600", href: "/admin/users" },
    { label: "Active Products", value: productsRes.count ?? 0,      icon: ShoppingBag,   color: "bg-green-50 text-green-600",   href: "/admin/products" },
    { label: "Conversations",   value: (conversationsRes.data as number | null) ?? 0, icon: MessageCircle, color: "bg-purple-50 text-purple-600", href: "#" },
    { label: "Active Subs",     value: activeSubs,                  icon: CreditCard,    color: "bg-amber-50 text-amber-600",   href: "/admin/subscriptions" },
    { label: "Expired Subs",    value: expiredSubs,                 icon: Clock,         color: "bg-orange-50 text-orange-600", href: "/admin/subscriptions" },
    { label: "Open Tickets",    value: openTicketsRes.count ?? 0,   icon: TicketCheck,   color: "bg-red-50 text-red-600",       href: "/admin/tickets" },
    { label: "Expiring Soon",   value: expiringRes.data?.length ?? 0, icon: TrendingUp,  color: "bg-yellow-50 text-yellow-600", href: "/admin/subscriptions" },
  ];

  const quickLinks = [
    { href: "/admin/users",         label: "Manage Users",    primary: true  },
    { href: "/admin/products",      label: "Products",        primary: false },
    { href: "/admin/subscriptions", label: "Subscriptions",   primary: false },
    { href: "/admin/tickets",       label: "Tickets",         primary: false },
    { href: "/admin/logs",          label: "Logs",            primary: false },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={22} className="text-primary" /> Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Live overview of your marketplace</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} prefetch={href !== "#"}
            className="card p-4 hover:shadow-cream-md hover:border-primary/20 transition-all active:scale-95">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
              <Icon size={17} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {quickLinks.map(({ href, label, primary }) => (
            <Link key={href} href={href} prefetch
              className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                primary ? "bg-primary text-white hover:bg-primary-dark shadow-cream" : "border border-cream-200 text-gray-700 hover:bg-cream-100 hover:border-primary/30"
              }`}>
              {label} <ArrowRight size={14} className="shrink-0 opacity-60" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pending verification */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <UserCheck size={15} className="text-amber-500" /> Pending Verification
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingRes.data?.length ?? 0}
              </span>
            </h2>
            <Link href="/admin/users" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {(pendingRes.data?.length ?? 0) === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No pending verifications 🎉</p>
          ) : (
            <div className="space-y-2">
              {(pendingRes.data ?? []).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{u.company_name || u.full_name || u.email}</p>
                    <p className="text-[10px] text-gray-400 truncate">{u.email} · {formatDate(u.created_at)}</p>
                  </div>
                  <Link href="/admin/users" className="text-xs text-primary hover:underline shrink-0 ml-2">Review</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring subscriptions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Clock size={15} className="text-red-500" /> Expiring in 7 Days
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {expiringRes.data?.length ?? 0}
              </span>
            </h2>
            <Link href="/admin/subscriptions" className="text-xs text-primary hover:underline">Manage →</Link>
          </div>
          {(expiringRes.data?.length ?? 0) === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No subscriptions expiring soon</p>
          ) : (
            <div className="space-y-2">
              {(expiringRes.data ?? []).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{u.company_name || u.email}</p>
                    <p className="text-[10px] text-gray-400">Expires {formatDate(u.subscription_expiry)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                    u.subscription_tier === "elite" ? "bg-amber-100 text-amber-700" :
                    u.subscription_tier === "expert" ? "bg-blue-100 text-blue-700" :
                    "bg-green-100 text-green-700"
                  }`}>{u.subscription_tier}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Subscription tier breakdown */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 text-sm mb-4">Subscription Tiers</h2>
          <div className="space-y-3">
            {[
              { tier: "elite",    label: "Elite",    icon: Crown, cls: "bg-amber-400",  text: "text-amber-700" },
              { tier: "expert",   label: "Expert",   icon: Star,  cls: "bg-slate-400",  text: "text-slate-600" },
              { tier: "beginner", label: "Beginner", icon: Award, cls: "bg-orange-400", text: "text-orange-700" },
            ].map(({ tier, label, icon: Icon, cls, text }) => {
              const value = tiers[tier] ?? 0;
              const total = Object.values(tiers).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((value / total) * 100);
              return (
                <div key={tier} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
                    <Icon size={13} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold ${text}`}>{label}</span>
                      <span className="text-gray-500">{value} users ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cls}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-cream-100 flex justify-between text-xs text-gray-500">
              <span>Active: <strong className="text-green-600">{activeSubs}</strong></span>
              <span>Expired: <strong className="text-orange-500">{expiredSubs}</strong></span>
            </div>
          </div>
        </div>

        {/* Top products by views */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <Eye size={15} className="text-primary" /> Most Viewed Products
          </h2>
          {(topProductsRes.data?.length ?? 0) === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No views tracked yet</p>
          ) : (
            <div className="space-y-2">
              {(topProductsRes.data ?? []).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-cream-100 last:border-0">
                  <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.title}</p>
                    <p className="text-[10px] text-gray-400">{p.category}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                    <Eye size={11} /> {(p.view_count ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
