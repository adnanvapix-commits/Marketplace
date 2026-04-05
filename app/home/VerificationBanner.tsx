"use client";

import { useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function VerificationBanner() {
  useEffect(() => {
    const handler = () => {
      toast("Please complete verification to access platform features");
    };
    window.addEventListener("verificationRedirect", handler);
    return () => window.removeEventListener("verificationRedirect", handler);
  }, []);

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between">
      <p className="text-amber-800 text-sm font-medium">
        Your account verification is pending
      </p>
      <Link
        href="/account"
        className="text-sm font-semibold text-amber-900 underline hover:text-amber-700"
      >
        Complete Verification
      </Link>
    </div>
  );
}
