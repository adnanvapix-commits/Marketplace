import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreditCard, Crown, Star, Award, CheckCircle, Clock, ArrowUpCircle, RefreshCw } from "lucide-react";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import SubscriptionClient from "./SubscriptionClient";
import type { SubscriptionTier } from "@/types";

export const PLANS = [
  {
    tier: "beginner" as SubscriptionTier,
    icon: "🥉",
    price: 500,
    color: "border-orange-200 bg-orange-50/50",
    btnCls: "bg-orange-500 hover:bg-orange-600 text-white",
    features: [
      "Listed in marketplace",
      "Up to 10 product listings",
      "Basic profile badge",
      "Standard search placement",
    ],
  },
  {
    tier: "expert" as SubscriptionTier,
    icon: "⭐",
    price: 800,
    color: "border-slate-300 bg-slate-50/50",
    btnCls: "bg-slate-600 hover:bg-slate-700 text-white",
    features: [
      "Everything in Beginner",
      "Up to 50 product listings",
      "Expert profile badge",
      "Priority search placement",
      "Featured in category pages",
    ],
  },
  {
    tier: "elite" as SubscriptionTier,
    icon: "👑",
    price: 1000,
    color: "border-amber-300 bg-amber-50/50 ring-2 ring-amber-300",
    btnCls: "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white shadow-lg",
    features: [
      "Everything in Expert",
      "Unlimited product listings",
      "Elite gold crown badge",
      "Top search placement",
      "Homepage featured section",
      "Priority admin support",
    ],
    popular: true,
  },
];

const WA_NUMBER = "971556331247";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("subscription_tier, subscription_expiry, is_subscribed, full_name, company_name")
    .eq("id", user.id)
    .single();

  const tier = (profile?.subscription_tier ?? null) as SubscriptionTier;
  const expiry = profile?.subscription_expiry ? new Date(profile.subscription_expiry) : null;
  const isActive = !!(profile?.is_subscribed && expiry && expiry > new Date());
  const daysLeft = expiry ? Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const displayName = profile?.company_name || profile?.full_name || user.email?.split("@")[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Subscription</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your BULKORA membership and upgrade your plan</p>
      </div>

      {/* Current status card — live via client component */}
      <SubscriptionClient
        userId={user.id}
        initialTier={tier}
        initialExpiry={profile?.subscription_expiry ?? null}
        initialIsSubscribed={profile?.is_subscribed ?? false}
        displayName={displayName ?? ""}
        userEmail={user.email ?? ""}
        waNumber={WA_NUMBER}
        plans={PLANS}
      />
    </div>
  );
}
