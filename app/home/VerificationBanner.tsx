"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function VerificationBanner() {
  useEffect(() => {
    // Show toast if redirected from a restricted route
    if (document.cookie.includes("unverified_redirect=1")) {
      toast.error("Please complete verification to access this feature.");
      document.cookie = "unverified_redirect=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, []);

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-3">
      <p className="text-amber-800 text-sm font-medium text-center">
        Your account verification is pending. Your account is under verification. Please wait for admin approval.
      </p>
    </div>
  );
}
