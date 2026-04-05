"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function GuestCTA() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  // Hide once auth resolves and user is logged in
  if (hydrated && user) return null;

  return (
    <section className="py-10 sm:py-14 px-4 text-center">
      <div className="max-w-sm sm:max-w-xl mx-auto">
        <Lock size={28} className="text-primary mx-auto mb-3" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Access is Restricted
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Only verified and subscribed members can view listings.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="btn-primary py-3 text-base">
            Register Your Business
          </Link>
          <Link href="/login" className="btn-outline py-3 text-base">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
