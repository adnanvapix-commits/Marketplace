"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function HeroCTA() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  // Show nothing until hydrated to prevent flash
  if (!hydrated) {
    return (
      <div className="h-10 w-40" /> // Placeholder to prevent layout shift
    );
  }

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary-dark transition-colors px-2"
      >
        Go to Dashboard <ArrowRight size={14} />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary-dark transition-colors px-2"
    >
      Create free account <ArrowRight size={14} />
    </Link>
  );
}
