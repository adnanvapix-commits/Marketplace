import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle, User, Pencil, ShoppingBag, MessageCircle,
  CreditCard, CheckCircle, Clock, XCircle,
} from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import VerificationBadge from "@/components/VerificationBadge";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

// Cache 30s — reduces DB calls per page visit
export const revalidate = 30;

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Redirect admin straight to admin panel
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com").toLowerCase();
  if ((user.email || "").toLowerCase() === adminEmail) redirect("/admin");

  // Fetch profile + all products in parallel
  const [{ data: profile }, { data: productsRaw }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("products").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (profile?.role === "admin") redirect("/admin");

  const products = (productsRaw ?? []) as Product[];
  const roles: string[] = profile?.roles ?? [profile?.role ?? "buyer"];
  const subExpiry = profile?.subscription_expiry ? new Date(profile.subscription_expiry) : null;
  const subActive = profile?.is_subscribed && subExpiry && subExpiry > new Date();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">

      {/* ── Profile card ── */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" width={64} height={64}
                className="rounded-full object-cover w-full h-full" />
            ) : (
              <User size={28} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800 truncate">
              {profile?.full_name || profile?.company_name || user.email?.split("@")[0]}
            </h1>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
            {profile?.company_name && profile?.full_name && (
              <p className="text-sm text-gray-600 mt-0.5">{profile.company_name}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map((r) => (
                <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                  {r}
                </span>
              ))}
              <VerificationBadge isVerified={profile?.is_verified ?? false} />
              {profile?.subscription_tier && (
                <SubscriptionBadge tier={profile.subscription_tier} size="sm" />
              )}
              {profile?.is_subscribed && !profile?.subscription_tier && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">✓ Subscribed</span>
              )}
            </div>
          </div>

          <Link href="/profile/edit"
            className="btn-outline text-sm flex items-center gap-1.5 shrink-0 self-start sm:self-center">
            <Pencil size={14} /> Edit Profile
          </Link>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: "Phone",        value: profile?.phone },
            { label: "Country",      value: profile?.country },
            { label: "Member Since", value: new Date(user.created_at).toLocaleDateString("en-GB") },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm font-medium text-gray-700">{value || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status cards ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Verification */}
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

        {/* Subscription */}
        <div className="card p-3 sm:p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Subscription</p>
          {subActive ? (
            <div className="flex flex-col gap-1">
              <SubscriptionBadge tier={profile?.subscription_tier ?? null} size="sm" />
              {profile?.subscription_expiry && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Expires {new Date(profile.subscription_expiry).toLocaleDateString("en-GB")}
                </p>
              )}
            </div>
          ) : (
            <Link href="/subscription"
              className="flex items-center gap-1 text-orange-500 font-semibold text-xs sm:text-sm hover:underline">
              <CreditCard size={14} /> Subscribe
            </Link>
          )}
        </div>

        {/* Listings count */}
        <div className="card p-3 sm:p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Listings</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>

        {/* Chats shortcut */}
        <div className="card p-3 sm:p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Chats</p>
          <Link href="/chat" className="text-2xl font-bold text-gray-800 hover:text-primary transition-colors">→</Link>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-3">
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

      {/* ── My Listings ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">
            My Listings <span className="text-gray-400 font-normal text-sm">({products.length})</span>
          </h2>
          <Link href="/sell" className="btn-primary text-sm flex items-center gap-1.5 py-2">
            <PlusCircle size={14} /> New Listing
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            <ShoppingBag size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm mb-4">No listings yet</p>
            <Link href="/sell" className="btn-primary text-sm">Post Your First Listing</Link>
          </div>
        ) : (
          <>
            {/* Full ProductCard view (same as dashboard had) */}
            <div className="flex flex-col gap-2 mb-4">
              {products.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Grid with edit/delete actions for all listings */}
            {products.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-3 mt-6">
                  Manage Listings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="card p-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate text-sm">{p.title}</h3>
                        <p className="text-primary font-bold mt-0.5">
                          AED {p.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            p.condition === "new"         ? "bg-green-100 text-green-700" :
                            p.condition === "used"        ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-blue-100 text-blue-700"}`}>
                            {p.condition}
                          </span>
                          <span className="text-xs text-gray-400">{p.category}</span>
                          <span className="text-xs text-gray-400">Qty: {p.quantity}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/product/${p.id}/edit`}
                          className="flex-1 text-center text-sm py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium">
                          Edit
                        </Link>
                        <DeleteProductButton productId={p.id} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
