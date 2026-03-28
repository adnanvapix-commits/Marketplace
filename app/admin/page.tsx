import { createAdminClient } from "@/lib/supabase/admin";
import { Users, ShoppingBag, MessageCircle, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getStats() {
  // Admin client bypasses RLS — sees all rows
  const db = createAdminClient();
  const [users, products, messages, subscribed] = await Promise.all([
    db.from("users").select("id", { count: "exact", head: true }),
    db.from("products").select("id", { count: "exact", head: true }),
    db.from("messages").select("id", { count: "exact", head: true }),
    db.from("users").select("id", { count: "exact", head: true }).eq("is_subscribed", true),
  ]);
  return {
    users: users.count ?? 0,
    products: products.count ?? 0,
    messages: messages.count ?? 0,
    subscribed: subscribed.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Total Users",        value: stats.users,      icon: Users,          color: "bg-blue-50 text-blue-600",   href: "/admin/users" },
    { label: "Total Products",     value: stats.products,   icon: ShoppingBag,    color: "bg-green-50 text-green-600", href: "/admin/products" },
    { label: "Total Messages",     value: stats.messages,   icon: MessageCircle,  color: "bg-purple-50 text-purple-600", href: "#" },
    { label: "Subscribed Users",   value: stats.subscribed, icon: CreditCard,     color: "bg-orange-50 text-orange-600", href: "/admin/subscriptions" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={22} className="text-primary" /> Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your marketplace</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/users"         className="btn-primary text-sm">Manage Users</Link>
          <Link href="/admin/products"      className="btn-outline text-sm">Manage Products</Link>
          <Link href="/admin/subscriptions" className="btn-outline text-sm">Subscriptions</Link>
          <Link href="/admin/logs"          className="btn-outline text-sm">View Logs</Link>
        </div>
      </div>
    </div>
  );
}
