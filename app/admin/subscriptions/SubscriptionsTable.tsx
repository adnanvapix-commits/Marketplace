"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, Search, Crown, Star, Zap } from "lucide-react";
import type { AdminUser } from "@/lib/services/adminService";
import toast from "react-hot-toast";

interface Props {
  initialUsers: AdminUser[];
  adminId: string;
  tierEnabled?: boolean;
}

type SubFilter = "all" | "active" | "expired" | "none";
type Tier = "elite" | "expert" | "beginner" | null;

// Pricing — internal only, never shown to end users
const TIER_PRICES: Record<string, number> = {
  elite: 1000,
  expert: 800,
  beginner: 500,
};

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  elite:    { label: "Elite",    color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200", icon: Crown },
  expert:   { label: "Expert",   color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",  icon: Star },
  beginner: { label: "Beginner", color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200", icon: Zap },
};

export default function SubscriptionsTable({ initialUsers, adminId, tierEnabled = true }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SubFilter>("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [customExpiry, setCustomExpiry] = useState<Record<string, string>>({});
  const now = new Date();

  void adminId; // used for audit logs via API

  function subStatus(user: AdminUser): "active" | "expired" | "none" {
    if (!user.is_subscribed) return "none";
    if (user.subscription_expiry && new Date(user.subscription_expiry) < now) return "expired";
    return "active";
  }

  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const status = subStatus(u);
    const matchFilter = filter === "all" || filter === status;
    return matchSearch && matchFilter;
  });

  async function patch(userId: string, body: Record<string, unknown>) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...body }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    return true;
  }

  async function handleActivate(user: AdminUser) {
    setLoading(user.id);
    const expiry = customExpiry[user.id]
      ? new Date(customExpiry[user.id]).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString();
    const tier: Tier = (user.subscription_tier as Tier) ?? "beginner";
    try {
      await patch(user.id, { is_subscribed: true, subscription_expiry: expiry, subscription_tier: tier });
      setUsers((prev) => prev.map((u) =>
        u.id === user.id ? { ...u, is_subscribed: true, subscription_expiry: expiry, subscription_tier: tier } : u
      ));
      toast.success("Subscription activated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(null); }
  }

  async function handleDeactivate(user: AdminUser) {
    setLoading(user.id);
    try {
      await patch(user.id, { is_subscribed: false, subscription_expiry: null, subscription_tier: null });
      setUsers((prev) => prev.map((u) =>
        u.id === user.id ? { ...u, is_subscribed: false, subscription_expiry: null, subscription_tier: null } : u
      ));
      toast.success("Subscription deactivated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(null); }
  }

  async function handleSetTier(user: AdminUser, tier: Tier) {
    setLoading(user.id + "_tier");
    try {
      await patch(user.id, { subscription_tier: tier });
      setUsers((prev) => prev.map((u) =>
        u.id === user.id ? { ...u, subscription_tier: tier } : u
      ));
      toast.success(tier ? `Tier set to ${TIER_CONFIG[tier].label}` : "Tier removed");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(null); }
  }

  const statusBadge = (user: AdminUser) => {
    const s = subStatus(user);
    if (s === "active")  return <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle size={12} /> Active</span>;
    if (s === "expired") return <span className="flex items-center gap-1 text-orange-500 text-xs font-semibold"><Clock size={12} /> Expired</span>;
    return <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircle size={12} /> None</span>;
  };

  const tierBadge = (tier: Tier) => {
    if (!tier) return <span className="text-xs text-gray-400">—</span>;
    const c = TIER_CONFIG[tier];
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.color} ${c.border}`}>
        <Icon size={10} /> {c.label}
      </span>
    );
  };

  // Tier counts for header summary
  const counts = {
    elite:    users.filter((u) => u.subscription_tier === "elite").length,
    expert:   users.filter((u) => u.subscription_tier === "expert").length,
    beginner: users.filter((u) => u.subscription_tier === "beginner").length,
  };

  return (
    <div className="space-y-4">

      {/* Tier summary cards — only when migration has run */}
      {tierEnabled && (
        <div className="grid grid-cols-3 gap-3">
        {(["elite", "expert", "beginner"] as const).map((tier) => {
          const c = TIER_CONFIG[tier];
          const Icon = c.icon;
          return (
            <div key={tier} className={`rounded-xl border p-3 sm:p-4 ${c.bg} ${c.border}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={15} className={c.color} />
                <span className={`text-xs font-bold uppercase tracking-widest ${c.color}`}>{c.label}</span>
              </div>
              <p className={`text-2xl font-bold ${c.color}`}>{counts[tier]}</p>
              <p className="text-xs text-gray-500 mt-0.5">AED {TIER_PRICES[tier].toLocaleString()} / mo</p>
            </div>
          );
        })}
        </div>
      )}

      {/* Filters */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="input pl-9 text-sm min-h-[40px]"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as SubFilter)}
          className="input text-sm min-h-[40px] sm:w-44"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="none">No Subscription</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-cream-200 bg-cream-50">
              {["Email", "Status", ...(tierEnabled ? ["Tier"] : []), "Expiry", "Set Expiry", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={tierEnabled ? 6 : 5} className="text-center py-10 text-gray-400 text-sm">No users found</td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{user.email}</td>
                  <td className="px-4 py-3">{statusBadge(user)}</td>
                  {tierEnabled && (
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {tierBadge(user.subscription_tier as Tier)}
                        <div className="flex gap-1">
                          {(["elite", "expert", "beginner"] as const).map((t) => {
                            const active = user.subscription_tier === t;
                            const c = TIER_CONFIG[t];
                            return (
                              <button
                                key={t}
                                onClick={() => handleSetTier(user, active ? null : t)}
                                disabled={loading === user.id + "_tier"}
                                title={`${active ? "Remove" : "Set"} ${c.label} (AED ${TIER_PRICES[t]})`}
                                className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold transition-all disabled:opacity-40 ${
                                  active
                                    ? `${c.bg} ${c.color} ${c.border}`
                                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                {c.label[0]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Expiry */}
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {user.subscription_expiry
                      ? new Date(user.subscription_expiry).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* Custom expiry */}
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={customExpiry[user.id] ?? ""}
                      onChange={(e) => setCustomExpiry((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      className="input text-xs py-1 w-36"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleActivate(user)}
                        disabled={loading === user.id}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50 font-semibold"
                      >
                        {loading === user.id ? "…" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeactivate(user)}
                        disabled={loading === user.id || !user.is_subscribed}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50 font-semibold"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
