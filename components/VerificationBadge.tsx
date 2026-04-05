"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

interface VerificationBadgeProps {
  isVerified: boolean;
}

export default function VerificationBadge({ isVerified }: VerificationBadgeProps) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle size={12} /> Verified
      </span>
    );
  }

  return (
    <div className="relative group">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <AlertCircle size={12} /> Unverified
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-800 text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Complete verification to publish listings
      </span>
    </div>
  );
}
