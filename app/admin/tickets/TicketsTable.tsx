"use client";

import { useState } from "react";
import { CheckCircle, Clock, AlertCircle, XCircle, Search, Send, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

interface Ticket {
  id: string;
  user_email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  open:        { label: "Open",        cls: "bg-blue-50 text-blue-700 border-blue-200",    icon: Clock },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertCircle },
  resolved:    { label: "Resolved",    cls: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
  closed:      { label: "Closed",      cls: "bg-gray-100 text-gray-500 border-gray-200",   icon: XCircle },
};

const CATEGORY_LABELS: Record<string, string> = {
  subscription: "Subscription", account: "Account",
  product: "Products", payment: "Payment",
  verification: "Verification", technical: "Technical", other: "Other",
};

export default function TicketsTable({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = tickets.filter((t) => {
    const matchSearch = t.user_email.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary counts
  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(s => [s, tickets.filter(t => t.status === s).length])
  );

  async function handleUpdate(ticketId: string, status: string, admin_reply?: string) {
    setLoading(ticketId);
    try {
      const res = await fetch("/api/support/ticket", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status, admin_reply: admin_reply ?? undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setTickets(prev => prev.map(t =>
        t.id === ticketId
          ? { ...t, status, admin_reply: admin_reply ?? t.admin_reply, updated_at: new Date().toISOString() }
          : t
      ));
      toast.success("Ticket updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleReply(ticket: Ticket) {
    const reply = replies[ticket.id]?.trim();
    if (!reply) { toast.error("Write a reply first"); return; }
    await handleUpdate(ticket.id, "resolved", reply);
    setReplies(prev => ({ ...prev, [ticket.id]: "" }));
  }

  return (
    <div className="space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className={`rounded-xl border p-3 ${cfg.cls}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} />
                <span className="text-xs font-bold uppercase tracking-widest">{cfg.label}</span>
              </div>
              <p className="text-2xl font-bold">{counts[key] ?? 0}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by email or subject..." className="input pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="input text-sm sm:w-44">
          <option value="all">All Tickets</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Ticket list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="card p-10 text-center text-gray-400 text-sm">No tickets found</div>
        ) : (
          filtered.map((ticket) => {
            const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
            const Icon = cfg.icon;
            const isExpanded = expanded === ticket.id;

            return (
              <div key={ticket.id} className="card overflow-hidden">
                {/* Header row */}
                <button
                  className="w-full flex items-start sm:items-center justify-between gap-3 p-4 hover:bg-cream-50 transition-colors text-left"
                  onClick={() => setExpanded(isExpanded ? null : ticket.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                      <span className="text-xs bg-cream-100 text-gray-600 px-2 py-0.5 rounded-full border border-cream-200 font-medium">
                        {CATEGORY_LABELS[ticket.category] ?? ticket.category}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ticket.user_email} · {new Date(ticket.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-cream-100 p-4 space-y-4 bg-cream-50/30">
                    {/* User message */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">User Message</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-xl border border-cream-100">{ticket.message}</p>
                    </div>

                    {/* Admin reply (if any) */}
                    {ticket.admin_reply && (
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Your Reply</p>
                        <p className="text-sm text-gray-700 leading-relaxed bg-primary-light p-3 rounded-xl">{ticket.admin_reply}</p>
                      </div>
                    )}

                    {/* Reply box */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {ticket.admin_reply ? "Update Reply" : "Write Reply"}
                      </p>
                      <textarea
                        value={replies[ticket.id] ?? ""}
                        onChange={e => setReplies(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="input text-sm resize-none" rows={3}
                        placeholder="Type your reply to the user..."
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleReply(ticket)}
                          disabled={loading === ticket.id}
                          className="btn-primary text-xs py-2 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {loading === ticket.id ? "Sending..." : <><Send size={12} /> Reply & Resolve</>}
                        </button>
                        {ticket.status !== "in_progress" && (
                          <button onClick={() => handleUpdate(ticket.id, "in_progress")}
                            disabled={loading === ticket.id}
                            className="text-xs px-3 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-semibold disabled:opacity-50">
                            Mark In Progress
                          </button>
                        )}
                        {ticket.status !== "closed" && (
                          <button onClick={() => handleUpdate(ticket.id, "closed")}
                            disabled={loading === ticket.id}
                            className="text-xs px-3 py-2 rounded-lg bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200 font-semibold disabled:opacity-50">
                            Close Ticket
                          </button>
                        )}
                        {ticket.status === "closed" && (
                          <button onClick={() => handleUpdate(ticket.id, "open")}
                            disabled={loading === ticket.id}
                            className="text-xs px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold disabled:opacity-50">
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
