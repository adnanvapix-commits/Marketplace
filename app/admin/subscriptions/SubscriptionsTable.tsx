"use client";

import { useState } from "react";
import {
  CheckCircle, XCircle, Clock, Search, Crown, Star, Zap,
  Plus, Minus, UserCheck, UserX, Loader2,
} from "lucide-react";
import type { AdminUser } from "@/lib/services/adminService";
import { formatDate } from "@/lib/utils/formatDate";
import toast from "react-hot-toast";

interface Props {
  initialUsers: AdminUser[];
  adminId: string;
  tierEnabled?: boolean;
}

type SubFilter = "all" | "active" | "expired" | "none";
type Tier = "elite" | "expert" | "beginner" | null;

const TIER_PRICES: Record<string, { quarterly: number; annual: number }> = {
  elite:    { quarterly: 3000, annual: 10000 },
  expert:   { quarterly: 2400, annual: 8000  },
  beginner: { quarterly: 1500, annual: 5000  },
};

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  elite:    { label: "Elite",    color: "text-amber-700", bg: "bg-amber-50",  border: "border-amber-200", icon: Crown },
  expert:   { label: "Expert",   color: "text-blue-700",  bg: "bg-blue-50",   border: "border-blue-200",  icon: Star  },
  beginner: { label: "Beginner", color: "text-green-700", bg: "bg-green-50",  border: "border-green-200", icon: Zap   },
};

export default function SubscriptionsTable({ initialUsers, adminId, tierEnabled = true }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SubFilter>("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [customExpiry, setCustomExpiry] = useState<Record<string, string>>({});
  const now = new Date();

  void adminId;

  function subStatus(user: AdminUser): "active" | "expired" | "none" {
    if (!user.is_subscribed) return "none";
    if (user.subscription_expiry && new Date(user.subscription_expiry) < now) return "expired";
    return "active";
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.company_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || filter === subStatus(u);
    return matchSearch && matchFilter;
  });

  const counts = {
    active:   users.filter(u => subStatus(u) === "active").length,
    expired:  users.filter(u => subStatus(u) === "expired").length,
    none:     users.filter(u => subStatus(u) === "none").length,
    elite:    users.filter(u => u.subscription_tier === "elite").length,
    expert:   users.filter(u => u.subscription_tier === "expert").length,
    beginner: users.filter(u => u.subscription_tier === "beginner").length,
  };

  async function patchUser(userId: string, body: Record<string, unknown>) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...body }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
  }

  async function verifyUser(user: AdminUser, action: "approve" | "reject") {
    setLoading(user.id + "_verify");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setUsers(prev => prev.map(u =>
        u.id === user.id
          ? {
              ...u,
              is_verified: action === "approve",
              verification_status: (action === "approve" ? "approved" : "rejected") as "approved" | "pending" | "rejected",
            }
          : u
      ));
      toast.success(action === "approve" ? "User verified ✓" : "Verification rejected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  // +3 months from current expiry (if still active) or from today
  async function handleActivate(user: AdminUser) {
    setLoading(user.id);
    try {
      let expiryDate: Date;
      if (customExpiry[user.id]) {
        expiryDate = new Date(customExpiry[user.id]);
      } else {
        const base =
          user.subscription_expiry && new Date(user.subscription_expiry) > now
            ? new Date(user.subscription_expiry)
            : now;
        expiryDate = new Date(base);
        expiryDate.setMonth(expiryDate.getMonth() + 3);
      }
      const expiry = expiryDate.toISOString();
      const tier: Tier = (user.subscription_tier as Tier) ?? "beginner";
      await patchUser(user.id, { is_subscribed: true, subscription_expiry: expiry, subscription_tier: tier });
      setUsers(prev => prev.map(u =>
        u.id === user.id
          ? { ...u, is_subscribed: true, subscription_expiry: expiry, subscription_tier: tier }
          : u
      ));
      toast.success(`Subscription activated — expires ${formatDate(expiryDate)}`);
      setCustomExpiry(prev => { const n = { ...prev }; delete n[user.id]; return n; });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleDeactivate(user: AdminUser) {
    setLoading(user.id);
    try {
      await patchUser(user.id, { is_subscribed: false, subscription_expiry: null, subscription_tier: null });
      setUsers(prev => prev.map(u =>
        u.id === user.id
          ? { ...u, is_subscribed: false, subscription_expiry: null, subscription_tier: null }
          : u
      ));
      toast.success("Subscription deactivated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSetTier(user: AdminUser, tier: Tier) {
    setLoading(user.id + "_tier");
    try {
      await patchUser(user.id, { subscription_tier: tier });
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, subscription_tier: tier } : u
      ));
      toast.success(tier ? `Tier → ${TIER_CONFIG[tier].label}` : "Tier removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  const statusBadge = (user: AdminUser) => {
    const s = subStatus(user);
    if (s === "active")  return <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2 py-0.5 rounded-full"><CheckCircle size={11} /> Active</span>;
    if (s === "expired") return <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-semibold px-2 py-0.5 rounded-full"><Clock size={11} /> Expired</span>;
    return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 border border-gray-200 text-xs font-semibold px-2 py-0.5 rounded-full"><XCircle size={11} /> None</span>;
  };

  const verifyBadge = (user: AdminUser) => {
    if (user.is_verified)
      return <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2 py-0.5 rounded-full"><CheckCircle size={11} /> Verified</span>;
    if (user.verification_status === "rejected")
      return <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-2 py-0.5 rounded-full"><XCircle size={11} /> Rejected</span>;
    return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold px-2 py-0.5 rounded-full"><Clock size={11} /> Pending</span>;
  };

  return (
    <div className="space-y-4">

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: "Active",   value: counts.active,   cls: "text-green-700 bg-green-50 border-green-200" },
          { label: "Expired",  value: counts.expired,  cls: "text-orange-600 bg-orange-50 border-orange-200" },
          { label: "None",     value: counts.none,     cls: "text-gray-500 bg-gray-50 border-gray-200" },
          { label: "Elite",    value: counts.elite,    cls: "text-amber-700 bg-amber-50 border-amber-200" },
          { label: "Expert",   value: counts.expert,   cls: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Beginner", value: counts.beginner, cls: "text-green-700 bg-green-50 border-green-200" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`rounded-xl border p-3 text-center ${cls}`}>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pricing reference */}
      {tierEnabled && (
        <div className="card p-3 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="font-semibold text-gray-600">Pricing:</span>
          {(["elite", "expert", "beginner"] as const).map(t => (
            <span key={t} className={`inline-flex items-center gap-1 font-medium ${TIER_CONFIG[t].color}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}: AED {TIER_PRICES[t].quarterly.toLocaleString()} /qtr · AED {TIER_PRICES[t].annual.toLocaleString()} /yr
            </span>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email, name, or company..."
            className="input pl-9 text-sm min-h-[40px]"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as SubFilter)}
          className="input text-sm min-h-[40px] sm:w-48"
        >
          <option value="all">All Users</option>
          <option value="active">Active Subscription</option>
          <option value="expired">Expired</option>
          <option value="none">No Subscription</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-cream-200 bg-cream-50">
              {[
                "User", "Verification", "Subscription", tierEnabled ? "Tier" : null,
                "Expiry", "Custom Expiry", "Actions",
              ].filter(Boolean).map((h) => (
                <th key={h!} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={tierEnabled ? 7 : 6} className="text-center py-10 text-gray-400 text-sm">
                  No users found
                </td>
              </tr>
            ) : filtered.map((user) => {
              const isLoadingVerify = loading === user.id + "_verify";
              const isLoadingSub    = loading === user.id;
              const isLoadingTier   = loading === user.id + "_tier";

              return (
                <tr key={user.id} className="hover:bg-cream-50/60 transition-colors align-middle">

                  {/* User */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-sm truncate max-w-[180px]">{user.email}</p>
                    {user.full_name && <p className="text-xs text-gray-400 truncate">{user.full_name}</p>}
                    {user.company_name && <p className="text-xs text-gray-400 truncate">{user.company_name}</p>}
                  </td>

                  {/* Verification — badge + approve/reject buttons */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      {verifyBadge(user)}
                      {isLoadingVerify ? (
                        <Loader2 size={14} className="animate-spin text-gray-400" />
                      ) : !user.is_verified ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => verifyUser(user, "approve")}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-semibold"
                          >
                            <UserCheck size={10} /> Verify
                          </button>
                          <button
                            onClick={() => verifyUser(user, "reject")}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold"
                          >
                            <UserX size={10} /> Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => verifyUser(user, "reject")}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 font-semibold"
                        >
                          <UserX size={10} /> Unverify
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Subscription status */}
                  <td className="px-4 py-3">{statusBadge(user)}</td>

                  {/* Tier */}
                  {tierEnabled && (
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        {user.subscription_tier ? (() => {
                          const c = TIER_CONFIG[user.subscription_tier as string];
                          const Icon = c.icon;
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.color} ${c.border}`}>
                              <Icon size={10} /> {c.label}
                            </span>
                          );
                        })() : <span className="text-xs text-gray-400">—</span>}
                        <div className="flex gap-1">
                          {(["elite", "expert", "beginner"] as const).map((t) => {
                            const active = user.subscription_tier === t;
                            const c = TIER_CONFIG[t];
                            return (
                              <button
                                key={t}
                                onClick={() => handleSetTier(user, active ? null : t)}
                                disabled={isLoadingTier}
                                title={`${active ? "Remove" : "Set"} ${c.label}`}
                                className={`text-[10px] px-1.5 py-0.5 rounded border font-bold transition-all disabled:opacity-40 ${
                                  active
                                    ? `${c.bg} ${c.color} ${c.border}`
                                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                {t === "elite" ? "E" : t === "expert" ? "M" : "B"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Expiry */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${
                      user.subscription_expiry && new Date(user.subscription_expiry) < now
                        ? "text-red-500" : "text-gray-600"
                    }`}>
                      {formatDate(user.subscription_expiry)}
                    </span>
                  </td>

                  {/* Custom expiry picker */}
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={customExpiry[user.id] ?? ""}
                      onChange={e => setCustomExpiry(prev => ({ ...prev, [user.id]: e.target.value }))}
                      className="input text-xs py-1 min-h-[36px] w-36"
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {customExpiry[user.id] && (
                      <p className="text-[10px] text-primary mt-0.5">
                        Custom: {formatDate(new Date(customExpiry[user.id]))}
                      </p>
                    )}
                  </td>

                  {/* Subscription actions */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleActivate(user)}
                        disabled={isLoadingSub}
                        className="inline-flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-semibold disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {isLoadingSub ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                        {customExpiry[user.id] ? "Set Expiry" : "+3 Months"}
                      </button>
                      <button
                        onClick={() => handleDeactivate(user)}
                        disabled={isLoadingSub || !user.is_subscribed}
                        className="inline-flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        <Minus size={11} /> Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
