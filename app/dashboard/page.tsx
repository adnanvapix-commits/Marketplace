import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, MessageCircle, CreditCard, PlusCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, productsRes, chatsRes] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
    supabase.from("messages")
      .select("product_id", { count: "exact", head: true })
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
  ]);

  const profile = profileRes.data;
  const products = (productsRes.data as Product[]) ?? [];
  const chatCount = chatsRes.count ?? 0;

  const subExpiry = profile?.subscription_expiry
    ? new Date(profile.subscription_expiry)
    : null;
  const subActive = profile?.is_subscribed && subExpiry && subExpiry > new Date();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Welcome back, {profile?.company_name || user.email?.split("@")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Verification */}
        <div className="card p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Verification</p>
          {profile?.is_verified ? (
            <span className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
              <CheckCircle size={16} /> Verified
            </span>
          ) : profile?.verification_status === "rejected" ? (
            <span className="flex items-center gap-1.5 text-red-500 font-semibold text-sm">
              <XCircle size={16} /> Rejected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-yellow-500 font-semibold text-sm">
              <Clock size={16} /> Pending
            </span>
          )}
        </div>

        {/* Subscription */}
        <div className="card p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Subscription</p>
          {subActive ? (
            <div>
              <span className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                <CreditCard size={16} /> Active
              </span>
              {subExpiry && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Expires {subExpiry.toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <Link href="/subscribe" className="flex items-center gap-1.5 text-orange-500 font-semibold text-sm hover:underline">
              <CreditCard size={16} /> Subscribe
            </Link>
          )}
        </div>

        {/* Listings */}
        <div className="card p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">My Listings</p>
          <p className="text-2xl font-bold text-gray-800">{productsRes.data?.length ?? 0}</p>
        </div>

        {/* Chats */}
        <div className="card p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Active Chats</p>
          <p className="text-2xl font-bold text-gray-800">{chatCount}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/sell" className="btn-primary flex items-center gap-2 text-sm">
          <PlusCircle size={16} /> Post Listing
        </Link>
        <Link href="/buy" className="btn-outline flex items-center gap-2 text-sm">
          <ShoppingBag size={16} /> Browse Market
        </Link>
        <Link href="/chat" className="btn-outline flex items-center gap-2 text-sm">
          <MessageCircle size={16} /> Messages
        </Link>
      </div>

      {/* My listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">My Listings</h2>
          <Link href="/profile" className="text-primary text-sm hover:underline">View all</Link>
        </div>

        {products.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            <ShoppingBag size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No listings yet</p>
            <Link href="/sell" className="btn-primary text-sm mt-4 inline-block">Post Your First Listing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
