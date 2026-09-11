import { createAdminClient } from "@/lib/supabase/admin";
import { Users, ShoppingBag, MessageCircle, CreditCard, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

// Force dynamic so stats are always fresh but page itself is server-rendered fast
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getStats() {
  const db = createAdminClient();
  const [users, products, messages, subscribed] = await Promise.all([
    db.from("users").select("id", { count: "exact", head: true }),
    db.from("products").select("id", { count: "exact", head: true }),
    // Count distinct conversations: unique (sender_id, product_id) pairs
    db.rpc("count_conversations"),
    db.from("users").select("id", { count: "exact", head: true }).eq("is_subscribed", true),
  ]);
  return {
    users:         users.count      ?? 0,
    products:      products.count   ?? 0,
    conversations: (messages.data as number | null) ?? 0,
    subscribed:    subscribed.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Total Users",      value: stats.users,      icon: Users,         color: "bg-blue-50 text-blue-600",     href: "/admin/users" },
    { label: "Total Products",   value: stats.products,   icon: ShoppingBag,   color: "bg-green-50 text-green-600",   href: "/admin/products" },
    { label: "Conversations",   value: stats.conversations, icon: MessageCircle, color: "bg-purple-50 text-purple-600", href: "#" },
    { label: "Active Subs",      value: stats.subscribed, icon: CreditCard,    color: "bg-amber-50 text-amber-600",   href: "/admin/subscriptions" },
  ];

  const quickLinks = [
    { href: "/admin/users",         label: "Manage Users",    primary: true  },
    { href: "/admin/products",      label: "Manage Products", primary: false },
    { href: "/admin/subscriptions", label: "Subscriptions",   primary: false },
    { href: "/admin/tickets",       label: "Support Tickets", primary: false },
    { href: "/admin/logs",          label: "View Logs",       primary: false },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={22} className="text-primary" /> Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your marketplace</p>
      </div>

      {/* Stat cards — each is a prefetched link */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            prefetch={href !== "#"}
            className="card p-4 sm:p-5 hover:shadow-cream-md hover:border-primary/20 transition-all duration-150 active:scale-95"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-700 mb-4 text-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {quickLinks.map(({ href, label, primary }) => (
            <Link
              key={href}
              href={href}
              prefetch
              className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                primary
                  ? "bg-primary text-white hover:bg-primary-dark shadow-cream"
                  : "border border-cream-200 text-gray-700 hover:bg-cream-100 hover:border-primary/30"
              }`}
            >
              {label}
              <ArrowRight size={14} className="shrink-0 opacity-60" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
