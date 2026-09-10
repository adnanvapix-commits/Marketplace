"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function GuestCTA() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (hydrated && user) return null;

  return (
    <section className="py-10 sm:py-14 px-4 bg-cream-100 border-t border-cream-200">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
          <Lock size={22} className="text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          Access is Restricted
        </h2>
        <p className="text-gray-500 text-sm mb-7 max-w-sm mx-auto">
          Only verified and subscribed members can view listings and contact sellers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary flex items-center justify-center gap-2 py-3 px-8 text-sm">
            Register Your Business <ArrowRight size={15} />
          </Link>
          <Link href="/login" className="btn-outline flex items-center justify-center gap-2 py-3 px-8 text-sm">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
