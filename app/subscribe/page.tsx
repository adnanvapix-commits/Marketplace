"use client";

import { CheckCircle, Zap, Building2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    features: ["Up to 10 listings", "Basic search access", "Buyer-seller chat", "Email support"],
    highlight: false,
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    features: ["Unlimited listings", "Full marketplace access", "Priority chat", "Verified badge", "Analytics dashboard", "Priority support"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Everything in Pro", "Dedicated account manager", "API access", "Custom integrations", "SLA guarantee"],
    highlight: false,
  },
];

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Zap size={14} /> Subscription Required
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Get full access to the B2B marketplace. Connect with verified buyers and sellers worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card p-6 flex flex-col ${
                plan.highlight
                  ? "border-2 border-primary shadow-lg relative"
                  : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={18} className="text-primary" />
                  <h2 className="font-bold text-gray-800">{plan.name}</h2>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Contact your admin to activate your subscription manually.
        </p>
      </div>
    </div>
  );
}
