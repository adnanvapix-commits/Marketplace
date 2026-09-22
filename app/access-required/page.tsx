"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CreditCard, Clock, ArrowRight, MessageCircle } from "lucide-react";
import { Suspense } from "react";

function AccessRequiredContent() {
  const params = useSearchParams();
  const reason = params.get("reason") ?? "no_subscription";
  const from   = params.get("from") ?? "";

  const isNotVerified   = reason === "not_verified";
  const isNoSub         = reason === "no_subscription";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          isNotVerified ? "bg-amber-50" : "bg-orange-50"
        }`}>
          {isNotVerified
            ? <ShieldCheck size={36} className="text-amber-500" />
            : <CreditCard size={36} className="text-orange-500" />
          }
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {isNotVerified
            ? "Account Not Verified Yet"
            : "Subscription Required"
          }
        </h1>

        {/* Message */}
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          {isNotVerified
            ? "Your account is pending verification by our team. Once verified, you'll need an active subscription to access the marketplace."
            : "Your subscription has expired or you don't have an active plan. Upgrade to access listings, post products, and message sellers."
          }
        </p>

        {isNoSub && (
          <p className="text-gray-400 text-xs mb-6">
            You were trying to access{" "}
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
              {from || "a restricted page"}
            </span>
          </p>
        )}

        {/* Steps */}
        <div className="card p-4 text-left space-y-3 mb-6">
          {isNotVerified ? (
            <>
              <Step n={1} done  label="Create your account" />
              <Step n={2} active label="Wait for admin verification (24–48 hrs)" />
              <Step n={3}        label="Subscribe to a plan" />
              <Step n={4}        label="Access the full marketplace" />
            </>
          ) : (
            <>
              <Step n={1} done  label="Account verified ✓" />
              <Step n={2} active label="Choose and activate a subscription plan" />
              <Step n={3}        label="Access listings, chat, and post products" />
            </>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isNotVerified ? (
            <>
              <Link href="/profile" className="btn-outline flex items-center justify-center gap-2 text-sm py-3 px-6">
                <Clock size={15} /> Check Status
              </Link>
              <Link href="/help" className="btn-primary flex items-center justify-center gap-2 text-sm py-3 px-6">
                <MessageCircle size={15} /> Contact Support
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile" className="btn-outline flex items-center justify-center gap-2 text-sm py-3 px-6">
                Back to Profile
              </Link>
              <Link href="/subscription" className="btn-primary flex items-center justify-center gap-2 text-sm py-3 px-6">
                <CreditCard size={15} /> View Plans <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Need help?{" "}
          <Link href="/help" className="text-primary hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}

function Step({ n, done, active, label }: { n: number; done?: boolean; active?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        done   ? "bg-green-100 text-green-700" :
        active ? "bg-primary text-white" :
                 "bg-gray-100 text-gray-400"
      }`}>
        {done ? "✓" : n}
      </div>
      <span className={`text-sm ${
        done   ? "text-green-700 line-through opacity-60" :
        active ? "text-gray-800 font-semibold" :
                 "text-gray-400"
      }`}>{label}</span>
    </div>
  );
}

export default function AccessRequiredPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <AccessRequiredContent />
    </Suspense>
  );
}
