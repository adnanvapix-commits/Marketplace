"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronUp, LifeBuoy, Search,
  CheckCircle, Clock, AlertCircle, XCircle, Send, Loader2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const TICKET_CATEGORIES = [
  { value: "subscription", label: "Subscription & Billing" },
  { value: "account",      label: "Account & Profile" },
  { value: "product",      label: "Products & Listings" },
  { value: "payment",      label: "Payment Issue" },
  { value: "verification", label: "Verification" },
  { value: "technical",    label: "Technical Problem" },
  { value: "other",        label: "Other" },
];

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  open:        { label: "Open",        cls: "bg-blue-50 text-blue-700 border-blue-200",   icon: Clock },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertCircle },
  resolved:    { label: "Resolved",    cls: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
  closed:      { label: "Closed",      cls: "bg-gray-100 text-gray-500 border-gray-200",   icon: XCircle },
};

interface FAQ { q: string; a: string; }
interface FAQGroup { category: string; items: FAQ[]; }
interface Ticket {
  id: string; category: string; subject: string;
  status: string; created_at: string; admin_reply: string | null;
}

interface Props {
  faqs: FAQGroup[];
  isLoggedIn: boolean;
  userEmail: string;
  myTickets: Ticket[];
}

export default function HelpClient({ faqs, isLoggedIn, userEmail, myTickets: initialTickets }: Props) {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"faq" | "ticket" | "mytickets">("faq");

  // Ticket form state
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  const filteredFaqs = faqs.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, message }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Ticket submitted! We'll get back to you soon.");
      setCategory("");
      setSubject("");
      setMessage("");
      setActiveTab("mytickets");
      // Optimistically add to list
      setTickets((prev) => [{
        id: Date.now().toString(),
        category, subject,
        status: "open",
        created_at: new Date().toISOString(),
        admin_reply: null,
      }, ...prev]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-4">
          <LifeBuoy size={22} className="text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Help & Support</h1>
        <p className="text-gray-500 text-sm mt-2">Find answers or raise a ticket — we typically respond within 24 hours.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream-100 rounded-xl p-1 mb-6">
        {[
          { key: "faq",       label: "FAQ" },
          { key: "ticket",    label: "Raise a Ticket" },
          { key: "mytickets", label: `My Tickets${tickets.length > 0 ? ` (${tickets.length})` : ""}` },
        ].map(({ key, label }) => (
          <button key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key
                ? "bg-white text-primary shadow-soft"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── FAQ Tab ── */}
      {activeTab === "faq" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="input pl-9 text-sm"
            />
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No results for &quot;{search}&quot;</p>
              <button onClick={() => { setSearch(""); setActiveTab("ticket"); }}
                className="text-primary text-sm mt-2 hover:underline">
                Raise a ticket instead →
              </button>
            </div>
          ) : (
            filteredFaqs.map((group) => (
              <div key={group.category} className="card overflow-hidden">
                <div className="px-4 py-3 bg-cream-50 border-b border-cream-200">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{group.category}</h2>
                </div>
                <div className="divide-y divide-cream-100">
                  {group.items.map((item) => {
                    const key = `${group.category}-${item.q}`;
                    const isOpen = openFaq === key;
                    return (
                      <div key={key}>
                        <button
                          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-cream-50 transition-colors"
                          onClick={() => setOpenFaq(isOpen ? null : key)}
                        >
                          <span className="text-sm font-medium text-gray-800 pr-4">{item.q}</span>
                          {isOpen ? <ChevronUp size={16} className="text-primary shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed bg-cream-50/50">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          <div className="text-center pt-4">
            <p className="text-sm text-gray-400 mb-2">Can&apos;t find what you&apos;re looking for?</p>
            <button onClick={() => setActiveTab("ticket")} className="btn-primary text-sm">
              Raise a Support Ticket
            </button>
          </div>
        </div>
      )}

      {/* ── Raise Ticket Tab ── */}
      {activeTab === "ticket" && (
        <div>
          {!isLoggedIn ? (
            <div className="card p-8 text-center">
              <LifeBuoy size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="font-semibold text-gray-700 mb-2">Login required</p>
              <p className="text-sm text-gray-400 mb-4">You need to be logged in to raise a support ticket.</p>
              <Link href="/login" className="btn-primary text-sm">Login / Sign Up</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-5 sm:p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="input text-sm" required>
                  <option value="">Select a category</option>
                  {TICKET_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input type="text" value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input text-sm" required maxLength={120}
                  placeholder="Brief summary of your issue" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                  {category === "other" ? "Describe Your Query *" : "Message *"}
                </label>
                <textarea value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input text-sm resize-none" rows={6} required
                  placeholder={
                    category === "other"
                      ? "Please describe your query in detail — what you need help with and any relevant context..."
                      : "Describe your issue in detail. The more information you provide, the faster we can help."
                  }
                />
                {category === "other" && message.length < 30 && message.length > 0 && (
                  <p className="text-xs text-orange-500 mt-1">Please provide more detail (minimum 30 characters)</p>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs text-gray-500">
                <Clock size={13} className="text-primary shrink-0" />
                Submitting as <span className="font-medium text-gray-700 mx-1">{userEmail}</span> — we respond within 24 hours on business days.
              </div>

              <button type="submit" disabled={submitting || (category === "other" && message.length < 30)}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3 disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── My Tickets Tab ── */}
      {activeTab === "mytickets" && (
        <div className="space-y-3">
          {!isLoggedIn ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-gray-400 mb-4">Login to view your support tickets.</p>
              <Link href="/login" className="btn-primary text-sm">Login</Link>
            </div>
          ) : tickets.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">
              <LifeBuoy size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No tickets yet</p>
              <button onClick={() => setActiveTab("ticket")}
                className="text-primary text-sm mt-2 hover:underline">
                Raise your first ticket →
              </button>
            </div>
          ) : (
            tickets.map((ticket) => {
              const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
              const Icon = statusCfg.icon;
              const catLabel = TICKET_CATEGORIES.find(c => c.value === ticket.category)?.label ?? ticket.category;
              return (
                <div key={ticket.id} className="card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{catLabel} · {new Date(ticket.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusCfg.cls}`}>
                      <Icon size={11} /> {statusCfg.label}
                    </span>
                  </div>
                  {ticket.admin_reply && (
                    <div className="mt-3 pt-3 border-t border-cream-100">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Admin Reply</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{ticket.admin_reply}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
