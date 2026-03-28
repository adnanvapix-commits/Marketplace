"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";
import type { AdminUser } from "@/lib/services/adminService";
import toast from "react-hot-toast";

interface Props {
  initialUsers: AdminUser[];
  adminId: string;
}

type SubFilter = "all" | "active" | "expired" | "none";

export default function SubscriptionsTable({ initialUsers, adminId }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SubFilter>("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [customExpiry, setCustomExpiry] = useState<Record<string, string>>({});

  const now = new Date();

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

  async function handleActivate(user: AdminUser) {
    setLoading(user.id);
    const expiry = customExpiry[user.id]
      ? new Date(customExpiry[user.id]).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString();
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, is_subscribed: true, subscription_expiry: expiry }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_subscribed: true, subscription_expiry: expiry } : u));
      toast.success("Subscription activated");
    } catch { toast.error("Failed"); }
    finally { setLoading(null); }
  }

  async function handleDeactivate(user: AdminUser) {
    setLoading(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, is_subscribed: false, subscription_expiry: null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_subscribed: false, subscription_expiry: null } : u));
      toast.success("Subscription deactivated");
    } catch { toast.error("Failed"); }
    finally { setLoading(null); }
  }

  const statusBadge = (user: AdminUser) => {
    const s = subStatus(user);
    if (s === "active") return <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={12} /> Active</span>;
    if (s === "expired") return <span className="flex items-center gap-1 text-orange-500 text-xs font-medium"><Clock size={12} /> Expired</span>;
    return <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircle size={12} /> None</span>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..." className="input pl-9 text-sm min-h-[40px]"
          />
        </div>
        <select
          value={filter} onChange={(e) => setFilter(e.target.value as SubFilter)}
          className="input text-sm min-h-[40px] sm:w-44"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="none">No Subscription</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[580px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Expiry</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Custom Expiry</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No users found</td></tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{user.email}</td>
                  <td className="px-4 py-3">{statusBadge(user)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {user.subscription_expiry
                      ? new Date(user.subscription_expiry).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={customExpiry[user.id] ?? ""}
                      onChange={(e) => setCustomExpiry((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      className="input text-xs py-1 w-36"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleActivate(user)}
                        disabled={loading === user.id}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50 font-medium"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleDeactivate(user)}
                        disabled={loading === user.id || !user.is_subscribed}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
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
