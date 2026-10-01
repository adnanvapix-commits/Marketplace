"use client";

import { useState } from "react";
import { Send, Users, User, Bell, CheckCircle, Search, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDateTime } from "@/lib/utils/formatDate";

interface UserRow { id: string; email: string; full_name?: string; company_name?: string; }
interface NotifRow { id: string; user_id: string; type: string; title: string; message: string; created_at: string; read: boolean; }

const NOTIF_TYPES = [
  { value: "verification_approved", label: "✅ Verification Approved" },
  { value: "verification_rejected", label: "❌ Verification Rejected" },
  { value: "subscription_expiry",   label: "⏰ Subscription Expiry" },
  { value: "ticket_reply",          label: "💬 Ticket Reply" },
  { value: "new_message",           label: "📩 New Message" },
];

export default function NotificationSender({ users, recentNotifications }: { users: UserRow[]; recentNotifications: NotifRow[] }) {
  const [target, setTarget] = useState<"user" | "all">("user");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [type, setType] = useState("ticket_reply");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<NotifRow[]>(recentNotifications);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  const filteredUsers = users.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.company_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Delete a single notification from DB + UI
  async function handleDeleteOne(id: string, userId: string) {
    setDeletingId(id);
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        // Admin deletes by passing specific ids scoped to the notification's user
        body: JSON.stringify({ ids: [id], targetUserId: userId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setRecent(prev => prev.filter(n => n.id !== id));
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  // Delete ALL notifications shown in the list from DB + UI
  async function handleClearAll() {
    if (!confirm(`Permanently delete all ${recent.length} notifications? This removes them from all users.`)) return;
    setClearingAll(true);
    try {
      // Group by user_id so we can delete each user's notifications
      const byUser = recent.reduce<Record<string, string[]>>((acc, n) => {
        if (n.user_id && n.user_id !== "all") {
          if (!acc[n.user_id]) acc[n.user_id] = [];
          acc[n.user_id].push(n.id);
        }
        return acc;
      }, {});

      await Promise.all(
        Object.entries(byUser).map(([userId, ids]) =>
          fetch("/api/notifications", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, targetUserId: userId }),
          })
        )
      );

      setRecent([]);
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear all");
    } finally {
      setClearingAll(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (target === "user" && !selectedUserId) { toast.error("Select a user"); return; }
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }

    setSending(true);
    try {
      if (target === "all") {
        const userIds = users.map(u => u.id);
        for (let i = 0; i < userIds.length; i += 50) {
          const chunk = userIds.slice(i, i + 50);
          await Promise.all(chunk.map(userId =>
            fetch("/api/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, type, title: title.trim(), message: message.trim() }),
            })
          ));
        }
        toast.success(`Notification sent to all ${users.length} users`);
      } else {
        const res = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: selectedUserId, type, title: title.trim(), message: message.trim() }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const targetUser = users.find(u => u.id === selectedUserId);
        toast.success(`Sent to ${targetUser?.company_name || targetUser?.email}`);
      }

      const newNotif: NotifRow = {
        id: Date.now().toString(),
        user_id: target === "all" ? "all" : selectedUserId,
        type, title: title.trim(), message: message.trim(),
        created_at: new Date().toISOString(),
        read: false,
      };
      setRecent(prev => [newNotif, ...prev.slice(0, 29)]);
      setTitle("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Send form */}
      <div className="card p-5 sm:p-6">
        <h2 className="font-bold text-gray-800 text-sm mb-5 flex items-center gap-2">
          <Send size={15} className="text-primary" /> Compose Notification
        </h2>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Send To</label>
            <div className="flex bg-cream-100 rounded-xl p-1 gap-1">
              <button type="button" onClick={() => setTarget("user")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  target === "user" ? "bg-white text-primary shadow-soft" : "text-gray-500 hover:text-gray-700"
                }`}>
                <User size={14} /> Specific User
              </button>
              <button type="button" onClick={() => setTarget("all")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  target === "all" ? "bg-white text-primary shadow-soft" : "text-gray-500 hover:text-gray-700"
                }`}>
                <Users size={14} /> All Users ({users.length})
              </button>
            </div>
          </div>

          {target === "user" && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Select User</label>
              <div className="relative mb-1.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by email or company..." className="input pl-8 text-sm py-2" />
              </div>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                className="input text-sm" required={target === "user"} size={4}>
                {filteredUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.company_name || u.full_name || u.email} — {u.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Notification Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="input text-sm">
              {NOTIF_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="input text-sm" placeholder="e.g. Your subscription has been activated" required maxLength={100} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              className="input text-sm resize-none" rows={3}
              placeholder="Write the notification message..." required maxLength={500} />
            <p className="text-[10px] text-gray-400 mt-0.5 text-right">{message.length}/500</p>
          </div>

          <button type="submit" disabled={sending}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
            {sending
              ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
              : <><Send size={15} /> {target === "all" ? `Send to All ${users.length} Users` : "Send Notification"}</>
            }
          </button>
        </form>
      </div>

      {/* Recently sent */}
      <div className="card p-5 sm:p-6">
        <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
          <Bell size={15} className="text-primary" /> Recently Sent
          {recent.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:underline disabled:opacity-50"
            >
              {clearingAll
                ? <Loader2 size={11} className="animate-spin" />
                : <Trash2 size={11} />
              }
              Clear list
            </button>
          )}
        </h2>

        {recent.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No notifications sent yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {recent.map(n => {
              const targetUser = n.user_id === "all" ? null : users.find(u => u.id === n.user_id);
              const isDeleting = deletingId === n.id;
              return (
                <div key={n.id} className={`border border-cream-200 rounded-xl p-3 group relative transition-opacity ${isDeleting ? "opacity-40" : ""}`}>
                  <button
                    onClick={() => handleDeleteOne(n.id, n.user_id)}
                    disabled={isDeleting || clearingAll}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-30"
                    aria-label="Delete"
                  >
                    {isDeleting
                      ? <Loader2 size={13} className="animate-spin text-red-400" />
                      : <Trash2 size={13} />
                    }
                  </button>
                  <div className="flex items-start justify-between gap-2 mb-1 pr-5">
                    <p className="text-xs font-semibold text-gray-800 flex-1">{n.title}</p>
                    {n.read
                      ? <CheckCircle size={12} className="text-green-400 shrink-0 mt-0.5" />
                      : <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                    }
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{n.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      {n.user_id === "all"
                        ? <><Users size={10} /> All users</>
                        : <><User size={10} /> {targetUser?.company_name || targetUser?.email || "Unknown"}</>
                      }
                    </span>
                    <span>{formatDateTime(n.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
