"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, MessageCircle, ShieldCheck, CreditCard, TicketCheck, X, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils/formatDate";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, { icon: typeof Bell; color: string }> = {
  verification_approved: { icon: ShieldCheck,   color: "text-green-500" },
  verification_rejected: { icon: ShieldCheck,   color: "text-red-500"   },
  subscription_expiry:   { icon: CreditCard,    color: "text-amber-500" },
  new_message:           { icon: MessageCircle, color: "text-blue-500"  },
  ticket_reply:          { icon: TicketCheck,   color: "text-primary"   },
};

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen]       = useState(false);
  const panelRef              = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const { notifications: data } = await res.json();
      setNotifications(data ?? []);
    } catch { /* ignore */ }
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: "all" }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function deleteOne(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    // Optimistic remove
    setNotifications(prev => prev.filter(n => n.id !== id));
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }

  async function deleteAll(e: React.MouseEvent) {
    e.stopPropagation();
    setNotifications([]);
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: "all" }),
    });
  }

  useEffect(() => {
    fetchNotifications();

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-cream-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-soft-md border border-cream-200 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cream-100">
            <h3 className="text-sm font-bold text-gray-800">
              Notifications
              {notifications.length > 0 && (
                <span className="ml-1.5 text-xs font-normal text-gray-400">({notifications.length})</span>
              )}
            </h3>
            <div className="flex items-center gap-1.5">
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors">
                  <CheckCheck size={11} /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={deleteAll}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={11} /> Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-cream-100 transition-colors">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-cream-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Bell size={28} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg  = TYPE_ICON[n.type] ?? { icon: Bell, color: "text-gray-400" };
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 hover:bg-cream-50 transition-colors group ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!n.read ? "bg-primary/10" : "bg-cream-100"}`}>
                      <Icon size={15} className={cfg.color} />
                    </div>

                    {/* Content — click to mark read */}
                    <button onClick={() => markRead(n.id)} className="flex-1 min-w-0 text-left">
                      <p className={`text-xs font-semibold ${!n.read ? "text-gray-900" : "text-gray-600"} truncate`}>{n.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                    </button>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />}
                      {/* Delete button — always visible on mobile, hover on desktop */}
                      <button
                        onClick={(e) => deleteOne(n.id, e)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
