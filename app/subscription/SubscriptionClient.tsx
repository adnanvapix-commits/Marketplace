"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, CheckCircle, Clock, ArrowUpCircle, ArrowDownCircle, RefreshCw, Tag } from "lucide-react";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import type { SubscriptionTier } from "@/types";
import toast from "react-hot-toast";

type BillingPeriod = "quarterly" | "annual";

interface Plan {
  tier: SubscriptionTier;
  icon: string;
  price: number;          // base monthly price
  color: string;
  btnCls: string;
  features: string[];
  popular?: boolean;
}

// Pricing multipliers
const BILLING: Record<BillingPeriod, { months: number; label: string; discount: string; badge?: string }> = {
  quarterly: { months: 3,  label: "3 Months",  discount: "",       badge: "Minimum" },
  annual:    { months: 12, label: "Annual",     discount: "Save 2 months", badge: "Best Value" },
};

// Annual = pay for 10 months (2 months free)
function totalPrice(basePrice: number, period: BillingPeriod) {
  if (period === "annual") return basePrice * 10; // 2 months free
  return basePrice * 3;
}

function perMonthDisplay(basePrice: number, period: BillingPeriod) {
  if (period === "annual") return Math.round((basePrice * 10) / 12);
  return basePrice;
}

interface Props {
  userId: string;
  initialTier: SubscriptionTier;
  initialExpiry: string | null;
  initialIsSubscribed: boolean;
  displayName: string;
  userEmail: string;
  waNumber: string;
  plans: Plan[];
}

export default function SubscriptionClient({
  userId, initialTier, initialExpiry, initialIsSubscribed,
  displayName, userEmail, waNumber, plans,
}: Props) {
  const [tier, setTier] = useState<SubscriptionTier>(initialTier);
  const [expiry, setExpiry] = useState<Date | null>(initialExpiry ? new Date(initialExpiry) : null);
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [billing, setBilling] = useState<BillingPeriod>("quarterly");

  const isActive = isSubscribed && expiry && expiry > new Date();
  const daysLeft = expiry ? Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const currentPlan = plans.find((p) => p.tier === tier);

  // Realtime: reflect admin changes instantly
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`subscription-${userId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "users",
        filter: `id=eq.${userId}`,
      }, (payload) => {
        const row = payload.new as {
          subscription_tier?: string | null;
          subscription_expiry?: string | null;
          is_subscribed?: boolean;
        };
        const newTier = (row.subscription_tier ?? null) as SubscriptionTier;
        const newExpiry = row.subscription_expiry ? new Date(row.subscription_expiry) : null;
        const newSubscribed = row.is_subscribed ?? false;
        setTier(newTier);
        setExpiry(newExpiry);
        setIsSubscribed(newSubscribed);
        if (newSubscribed && !isSubscribed) toast.success("🎉 Your subscription has been activated!");
        else if (!newSubscribed && isSubscribed) toast.error("Your subscription has been deactivated.");
        else if (newTier && newTier !== tier) toast.success(`Your plan was upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}!`);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, isSubscribed, tier]);

  function waLink(planTier: SubscriptionTier, basePrice: number) {
    const total = totalPrice(basePrice, billing);
    const periodLabel = BILLING[billing].label;
    const msg = encodeURIComponent(
      `Hi BULKORA, I'd like to subscribe to the ${planTier?.toUpperCase()} plan — ${periodLabel} (AED ${total.toLocaleString()} total). My account email is: ${userEmail}`
    );
    return `https://wa.me/${waNumber}?text=${msg}`;
  }

  return (
    <>
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
                {tier ? <SubscriptionBadge tier={tier} size="lg" /> : <span className="text-sm font-semibold text-gray-500">No Active Plan</span>}
                {isActive
                  ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle size={12} /> Active</span>
                  : <span className="flex items-center gap-1 text-xs text-orange-500 font-medium"><Clock size={12} /> Inactive</span>
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">{displayName}</p>
            </div>
          </div>
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
                <p className="text-xs text-gray-400">Subscribe below to get started</p>
              </>
            )}
          </div>
        </div>
        {isActive && daysLeft !== null && daysLeft <= 14 && (
          <div className="mt-4 pt-4 border-t border-green-200 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            <RefreshCw size={14} className="shrink-0" />
            Expiring soon — contact support to renew before it expires.
          </div>
        )}
      </div>

      {/* Billing period toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Available Plans</h2>
          <div className="flex bg-cream-100 rounded-xl p-1 gap-1">
            {(["quarterly", "annual"] as BillingPeriod[]).map((p) => (
              <button key={p}
                onClick={() => setBilling(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billing === p ? "bg-white text-primary shadow-soft" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {BILLING[p].label}
                {billing === p && BILLING[p].badge && (
                  <span className={`ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    p === "annual" ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                  }`}>
                    {BILLING[p].badge}
                  </span>
                )}
                {billing !== p && p === "annual" && (
                  <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">
                    {BILLING[p].discount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {billing === "quarterly"
            ? "Minimum 3-month commitment. All prices in AED (UAE Dirhams)."
            : "Annual plan — pay for 10 months, get 12 months (2 months free). All prices in AED."}
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {plans.map(({ tier: planTier, icon, price, color, btnCls, features, popular }) => {
          const isCurrent = planTier === tier && isActive;
          const planIndex = plans.findIndex(p => p.tier === planTier);
          const currentIndex = plans.findIndex(p => p.tier === tier);
          const isUpgrade = planIndex > currentIndex;
          const isDegrade = currentIndex > -1 && planIndex < currentIndex;
          const total = totalPrice(price, billing);
          const perMonth = perMonthDisplay(price, billing);

          let btnLabel: React.ReactNode;
          if (!isActive || currentIndex === -1) btnLabel = <><CreditCard size={14} /> Subscribe</>;
          else if (isUpgrade) btnLabel = <><ArrowUpCircle size={14} /> Upgrade</>;
          else if (isDegrade) btnLabel = <><ArrowDownCircle size={14} /> Degrade</>;
          else btnLabel = <><CreditCard size={14} /> Subscribe</>;

          const actionCls = isDegrade ? "bg-gray-200 hover:bg-gray-300 text-gray-600" : btnCls;

          return (
            <div key={planTier} className={`card p-5 relative flex flex-col ${color}`}>
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 mt-1">
                <SubscriptionBadge tier={planTier} size="md" />
                {isCurrent && (
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">Current</span>
                )}
              </div>

              {/* Pricing */}
              <div className="mb-1">
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-gray-800">AED {total.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 mb-1">/ {billing === "quarterly" ? "3 months" : "year"}</span>
                </div>
                <p className="text-xs text-gray-400">
                  AED {perMonth.toLocaleString()} / month
                  {billing === "annual" && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-green-600 font-semibold">
                      <Tag size={9} /> Save AED {(price * 2).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>

              <ul className="space-y-1.5 mb-5 flex-1 mt-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button disabled className="w-full text-center text-sm font-semibold py-2.5 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-1.5">
                  <CheckCircle size={14} /> Current Plan
                </button>
              ) : (
                <a href={waLink(planTier, price)} target="_blank" rel="noopener noreferrer"
                  className={`w-full text-center text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 ${actionCls}`}>
                  {btnLabel}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Subscription details */}
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
            <span className="text-sm text-gray-500">Days Remaining</span>
            <span className={`text-sm font-semibold ${daysLeft && daysLeft <= 7 ? "text-red-500" : "text-gray-800"}`}>
              {isActive && daysLeft ? `${daysLeft} days` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Billing</span>
            <span className="text-sm text-gray-800">
              {currentPlan
                ? billing === "annual"
                  ? `Annual — AED ${totalPrice(currentPlan.price, "annual").toLocaleString()} / year`
                  : `Quarterly — AED ${totalPrice(currentPlan.price, "quarterly").toLocaleString()} / 3 months`
                : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Renewal</span>
            <span className="text-sm text-gray-800">
              {isActive
                ? <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi BULKORA, I'd like to renew my ${tier?.toUpperCase()} subscription. My account: ${userEmail}`)}`}
                    target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">Renew →</a>
                : <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi BULKORA, I'd like to subscribe. My account: ${userEmail}`)}`}
                    target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Contact us to activate →</a>
              }
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Account</span>
            <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{userEmail}</span>
          </div>
        </div>

        <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi BULKORA, I need help with my subscription. My account: ${userEmail}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-all active:scale-95">
          Contact Support
        </a>
      </div>
    </>
  );
}
