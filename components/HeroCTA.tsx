"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Props {
  variant?: "link" | "button";
}

export default function HeroCTA({ variant = "link" }: Props) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) {
    return variant === "button"
      ? <div className="h-12 w-44 rounded-xl bg-cream-200 animate-pulse" />
      : <div className="h-6 w-40" />;
  }

  if (user) {
    return (
      <Link
        href="/dashboard"
        className={variant === "button"
          ? "btn-primary inline-flex items-center gap-2 px-8 py-3 text-base"
          : "flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors px-2"
        }
      >
        Go to Dashboard <ArrowRight size={variant === "button" ? 16 : 14} />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className={variant === "button"
        ? "btn-primary inline-flex items-center gap-2 px-8 py-3 text-base"
        : "flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors px-2"
      }
    >
      {variant === "button" ? "Get Started Free" : "Create free account"}
      <ArrowRight size={variant === "button" ? 16 : 14} />
    </Link>
  );
}
