import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User, Pencil, ShoppingBag, MessageCircle,
  CreditCard, CheckCircle, Clock, XCircle, PlusCircle,
} from "lucide-react";
import VerificationBadge from "@/components/VerificationBadge";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import ManageListings from "./ManageListings";
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
    supabase.from("products")
      .select("id, title, price, condition, quantity, minimum_order_quantity, category, image_url, location, brand, user_id, created_at")
      .eq("user_id", user.id)
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

        <div className="card p-3 sm:p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Listings</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>

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

      {/* ── Manage Listings (with search) ── */}
      <ManageListings products={products} />

    </div>
  );
}
