"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import ModeToggle from "@/components/ModeToggle";

const LOCKED_FEATURES = [
  { label: "Buy", icon: "🛒" },
  { label: "Sell", icon: "🏷️" },
  { label: "Chat", icon: "💬" },
  { label: "Dashboard", icon: "📊" },
];

export default function LockedHome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Required</h1>
        <p className="text-gray-500 mb-6">
          Your account is under verification. Complete verification to unlock all features.
        </p>

        <Link
          href="/account"
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition mb-8"
        >
          Complete Verification
        </Link>

        <div className="flex justify-center mb-8">
          <ModeToggle disabled={true} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {LOCKED_FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="relative bg-gray-100 rounded-xl p-6 flex flex-col items-center gap-2 opacity-60"
            >
              <span className="text-3xl">{feature.icon}</span>
              <span className="text-sm font-medium text-gray-600">{feature.label}</span>
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl">
                <Lock size={20} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
