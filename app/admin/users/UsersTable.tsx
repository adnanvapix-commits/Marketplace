"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle, ShieldOff, Shield, CalendarPlus, Loader2, UserCheck, UserX } from "lucide-react";
import type { AdminUser } from "@/lib/services/adminService";
import toast from "react-hot-toast";

interface Props {
  initialUsers: AdminUser[];
  adminId: string;
}

export default function UsersTable({ initialUsers, adminId }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [extendUserId, setExtendUserId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState("30");

  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "subscribed" && u.is_subscribed) ||
      (filter === "unsubscribed" && !u.is_subscribed);
    return matchSearch && matchFilter;
  });

  async function handleVerify(user: AdminUser, action: "approve" | "reject") {
    setLoading(user.id);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setUsers((prev) => prev.map((u) => u.id === user.id
        ? { ...u, is_verified: action === "approve", verification_status: (action === "approve" ? "approved" : "rejected") as "approved" | "rejected" }
        : u
      ));
      toast.success(action === "approve" ? "User verified" : "User rejected");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function patchUser(userId: string, body: object, optimistic: Partial<AdminUser>) {
    setLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...body }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Request failed");
      }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...optimistic } : u));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSubscription(user: AdminUser, activate: boolean) {
    const expiry = activate
      ? new Date(Date.now() + 30 * 86400000).toISOString()
      : null;
    await patchUser(
      user.id,
      { is_subscribed: activate, subscription_expiry: expiry },
      { is_subscribed: activate, subscription_expiry: expiry }
    );
    toast.success(activate ? "Subscription activated" : "Subscription deactivated");
  }

  async function handleExtend(user: AdminUser) {
    const base = user.subscription_expiry ? new Date(user.subscription_expiry) : new Date();
    const expiry = new Date(base.getTime() + parseInt(extendDays) * 86400000).toISOString();
    await patchUser(
      user.id,
      { is_subscribed: true, subscription_expiry: expiry },
      { is_subscribed: true, subscription_expiry: expiry }
    );
    toast.success(`Extended by ${extendDays} days`);
    setExtendUserId(null);
  }

  async function handleBlock(user: AdminUser) {
    await patchUser(
      user.id,
      { is_blocked: !user.is_blocked },
      { is_blocked: !user.is_blocked }
    );
    toast.success(user.is_blocked ? "User unblocked" : "User blocked");
  }

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..." className="input pl-9 text-sm min-h-[40px]"
          />
        </div>
        <select
          value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="input text-sm min-h-[40px] sm:w-44"
        >
          <option value="all">All Users</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Not Subscribed</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[780px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Email","Role","Verified","Subscription","Expiry","Status","Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No users found</td></tr>
            ) : filtered.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.is_blocked ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-700" : user.role === "seller" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.verification_status === "approved" || user.is_verified ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={12} /> Verified</span>
                  ) : user.verification_status === "rejected" ? (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><XCircle size={12} /> Rejected</span>
                  ) : (
                    <span className="text-xs text-yellow-500 font-medium">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.is_subscribed
                    ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={13} /> Active</span>
                    : <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircle size={13} /> None</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {user.subscription_expiry ? new Date(user.subscription_expiry).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.is_blocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {user.is_blocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {loading === user.id ? (
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    ) : (
                      <>
                        {!user.is_verified && (
                          <>
                            <button onClick={() => handleVerify(user, "approve")}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium flex items-center gap-1">
                              <UserCheck size={11} /> Verify
                            </button>
                            <button onClick={() => handleVerify(user, "reject")}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium flex items-center gap-1">
                              <UserX size={11} /> Reject
                            </button>
                          </>
                        )}
                        {user.is_subscribed ? (
                          <button onClick={() => handleSubscription(user, false)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium">
                            Deactivate
                          </button>
                        ) : (
                          <button onClick={() => handleSubscription(user, true)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium">
                            Activate
                          </button>
                        )}
                        <button onClick={() => setExtendUserId(extendUserId === user.id ? null : user.id)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium flex items-center gap-1">
                          <CalendarPlus size={11} /> Extend
                        </button>
                        <button onClick={() => handleBlock(user)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 ${user.is_blocked ? "bg-gray-50 text-gray-600 hover:bg-gray-100" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}>
                          {user.is_blocked ? <><Shield size={11} /> Unblock</> : <><ShieldOff size={11} /> Block</>}
                        </button>
                      </>
                    )}
                  </div>
                  {extendUserId === user.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <input type="number" value={extendDays} onChange={(e) => setExtendDays(e.target.value)}
                        className="input text-xs w-16 py-1" min={1} max={365} />
                      <span className="text-xs text-gray-500">days</span>
                      <button onClick={() => handleExtend(user)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-primary text-white hover:bg-primary-dark">
                        Apply
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
