import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreditCard, Crown, Star, Award, CheckCircle, Clock, ArrowUpCircle, RefreshCw } from "lucide-react";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import type { SubscriptionTier } from "@/types";

const PLANS = [
  {
    tier: "beginner" as SubscriptionTier,
    icon: Award,
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
    icon: Star,
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
    icon: Crown,
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

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("subscription_tier, subscription_expiry, is_subscribed, full_name, company_name")
    .eq("id", user.id)
    .single();

  const tier = profile?.subscription_tier as SubscriptionTier ?? null;
  const expiry = profile?.subscription_expiry ? new Date(profile.subscription_expiry) : null;
  const isActive = profile?.is_subscribed && expiry && expiry > new Date();
  const daysLeft = expiry ? Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const currentPlan = PLANS.find((p) => p.tier === tier);
  const displayName = profile?.company_name || profile?.full_name || user.email?.split("@")[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Subscription</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your BULKORA membership and upgrade your plan</p>
      </div>

      {/* Current status card */}
      <div className={`card p-5 sm:p-6 mb-8 ${isActive ? "border-green-200 bg-green-50/30" : "border-orange-200 bg-orange-50/30"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? "bg-green-100" : "bg-orange-100"}`}>
              <CreditCard size={22} className={isActive ? "text-green-600" : "text-orange-500"} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Current Plan</p>
              <div className="flex items-center gap-2 flex-wrap">
                {tier ? (
                  <SubscriptionBadge tier={tier} size="lg" />
                ) : (
                  <span className="text-sm font-semibold text-gray-500">No Active Plan</span>
                )}
                {isActive ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle size={12} /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                    <Clock size={12} /> Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{displayName}</p>
            </div>
          </div>

          {/* Expiry info */}
          <div className="sm:text-right space-y-1">
            {isActive && expiry ? (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Expiry Date</p>
                <p className="text-base font-bold text-gray-800">
                  {expiry.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className={`text-xs font-medium ${daysLeft && daysLeft <= 7 ? "text-red-500" : "text-green-600"}`}>
                  {daysLeft && daysLeft > 0 ? `${daysLeft} days remaining` : "Expires today"}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Status</p>
                <p className="text-sm font-semibold text-orange-500">No active subscription</p>
                <p className="text-xs text-gray-400">Subscribe to access all features</p>
              </>
            )}
          </div>
        </div>

        {/* Renewal reminder */}
        {isActive && daysLeft !== null && daysLeft <= 14 && (
          <div className="mt-4 pt-4 border-t border-green-200 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            <RefreshCw size={14} className="shrink-0" />
            Your subscription expires soon. Contact admin to renew.
          </div>
        )}
      </div>

      {/* Pricing plans */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Available Plans</h2>
        <p className="text-sm text-gray-500 mb-5">All prices in AED (UAE Dirhams) per year. Contact admin to subscribe or upgrade.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map(({ tier: planTier, icon: Icon, price, color, btnCls, features, popular }) => {
            const isCurrent = planTier === tier && isActive;
            const isUpgrade = PLANS.findIndex(p => p.tier === planTier) > PLANS.findIndex(p => p.tier === tier);

            return (
              <div key={planTier} className={`card p-5 relative flex flex-col ${color}`}>
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4 mt-1">
                  <SubscriptionBadge tier={planTier} size="md" />
                  {isCurrent && (
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">
                      Current
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-800">AED {price.toLocaleString()}</span>
                  <span className="text-sm text-gray-400 ml-1">/ year</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={`mailto:support@bulkora.com?subject=Subscription Request - ${planTier?.toUpperCase()} Plan&body=Hi, I would like to subscribe to the ${planTier?.toUpperCase()} plan (AED ${price}/year). My account email is: ${user.email}`}
                  className={`w-full text-center text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                      : btnCls
                  }`}
                >
                  {isCurrent ? (
                    <><CheckCircle size={14} /> Current Plan</>
                  ) : isUpgrade ? (
                    <><ArrowUpCircle size={14} /> Upgrade</>
                  ) : (
                    <><CreditCard size={14} /> Subscribe</>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription details / history */}
      <div className="card p-5 sm:p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">Subscription Details</h2>
        <div className="divide-y divide-cream-100">
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Plan</span>
            <span className="text-sm font-semibold text-gray-800">
              {tier ? <SubscriptionBadge tier={tier} size="sm" /> : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`text-sm font-semibold ${isActive ? "text-green-600" : "text-gray-400"}`}>
              {isActive ? "✅ Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Expiry Date</span>
            <span className="text-sm font-semibold text-gray-800">
              {expiry ? expiry.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Renewal</span>
            <span className="text-sm text-gray-800">
              {isActive
                ? "Contact admin to renew before expiry"
                : "Contact admin to activate"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Billing</span>
            <span className="text-sm text-gray-800">Annual (AED {currentPlan?.price.toLocaleString() ?? "—"})</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Account</span>
            <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{user.email}</span>
          </div>
        </div>

        {/* Contact admin note */}
        <div className="mt-4 p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs text-gray-500 leading-relaxed">
          💡 To subscribe, renew, or upgrade your plan, email us at{" "}
          <a href="mailto:support@bulkora.com" className="text-primary font-medium hover:underline">
            support@bulkora.com
          </a>{" "}
          or contact your account manager. Payments are processed manually and confirmed within 24 hours.
        </div>
      </div>

    </div>
  );
}
