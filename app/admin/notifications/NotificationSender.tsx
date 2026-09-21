"use client";

import { useState } from "react";
import { Send, Users, User, Bell, CheckCircle, Search } from "lucide-react";
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

  const filteredUsers = users.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.company_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (target === "user" && !selectedUserId) { toast.error("Select a user"); return; }
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }

    setSending(true);
    try {
      if (target === "all") {
        // Send to all users via bulk API
        const userIds = users.map(u => u.id);
        // Batch in chunks of 50
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

      // Add to recent list
      const newNotif: NotifRow = {
        id: Date.now().toString(),
        user_id: target === "all" ? "all" : selectedUserId,
        type, title: title.trim(), message: message.trim(),
        created_at: new Date().toISOString(),
        read: false,
      };
      setRecent(prev => [newNotif, ...prev.slice(0, 29)]);

      // Reset form
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

          {/* Target toggle */}
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

          {/* User picker */}
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

          {/* Type */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Notification Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="input text-sm">
              {NOTIF_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="input text-sm" placeholder="e.g. Your subscription has been activated" required maxLength={100} />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              className="input text-sm resize-none" rows={3}
              placeholder="Write the notification message..." required maxLength={500} />
            <p className="text-[10px] text-gray-400 mt-0.5 text-right">{message.length}/500</p>
          </div>

          <button type="submit" disabled={sending}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
            {sending ? (
              <><span className="animate-spin">⏳</span> Sending...</>
            ) : (
              <><Send size={15} /> {target === "all" ? `Send to All ${users.length} Users` : "Send Notification"}</>
            )}
          </button>
        </form>
      </div>

      {/* Recent notifications sent */}
      <div className="card p-5 sm:p-6">
        <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
          <Bell size={15} className="text-primary" /> Recently Sent
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
              return (
                <div key={n.id} className="border border-cream-200 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
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
