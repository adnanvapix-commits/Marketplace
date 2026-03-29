import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, MessageCircle, CreditCard,
  PlusCircle, CheckCircle, Clock, XCircle, User,
} from "lucide-react";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Redirect admin to admin panel
  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com";
  if (profile?.role === "admin" || user.email === adminEmail) {
    redirect("/admin");
  }

  const [profileRes, productsRes, chatsRes] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("products").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(6),
    supabase.from("messages")
      .select("product_id", { count: "exact", head: true })
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
  ]);

  const profile = profileRes.data;
  const products = (productsRes.data as Product[]) ?? [];
  const chatCount = chatsRes.count ?? 0;
  const subExpiry = profile?.subscription_expiry ? new Date(profile.subscription_expiry) : null;
  const subActive = profile?.is_subscribed && subExpiry && subExpiry > new Date();

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 sm:py-8">

      {/* Profile header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <User size={22} />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
            {profile?.company_name || user.email?.split("@")[0]}
          </h1>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Status cards — 2x2 on mobile */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-3 sm:p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Verification</p>
          {profile?.is_verified ? (
            <span className="flex items-center gap-1 text-green-600 font-semibold text-xs sm:text-sm">
              <CheckCircle size={14} /> Verified
            </span>
          ) : profile?.verification_status === "rejected" ? (
            <span className="flex items-center gap-1 text-red-500 font-semibold text-xs sm:text-sm">
              <XCircle size={14} /> Rejected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-yellow-500 font-semibold text-xs sm:text-sm">
              <Clock size={14} /> Pending
            </span>
          )}
        </div>

        <div className="card p-3 sm:p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Subscription</p>
          {subActive ? (
            <span className="flex items-center gap-1 text-green-600 font-semibold text-xs sm:text-sm">
              <CreditCard size={14} /> Active
            </span>
          ) : (
            <Link href="/subscribe"
              className="flex items-center gap-1 text-orange-500 font-semibold text-xs sm:text-sm hover:underline">
              <CreditCard size={14} /> Subscribe
            </Link>
          )}
        </div>

        <div className="card p-3 sm:p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Listings</p>
          <p className="text-2xl font-bold text-gray-800">{productsRes.data?.length ?? 0}</p>
        </div>

        <div className="card p-3 sm:p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Chats</p>
          <p className="text-2xl font-bold text-gray-800">{chatCount}</p>
        </div>
      </div>

      {/* Quick actions — full width on mobile */}
      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-8">
        <Link href="/sell"
          className="btn-primary flex items-center justify-center gap-2 text-sm py-3 sm:py-2">
          <PlusCircle size={16} /> Post Listing
        </Link>
        <Link href="/buy"
          className="btn-outline flex items-center justify-center gap-2 text-sm py-3 sm:py-2">
          <ShoppingBag size={16} /> Browse Market
        </Link>
        <Link href="/chat"
          className="btn-outline flex items-center justify-center gap-2 text-sm py-3 sm:py-2">
          <MessageCircle size={16} /> Messages
        </Link>
      </div>

      {/* My listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800 text-sm sm:text-base">My Listings</h2>
          <Link href="/profile" className="text-primary text-xs sm:text-sm hover:underline">View all</Link>
        </div>

        {products.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <ShoppingBag size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm mb-4">No listings yet</p>
            <Link href="/sell" className="btn-primary text-sm">Post Your First Listing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
