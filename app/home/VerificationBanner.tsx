"use client";

export default function VerificationBanner() {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-3">
      <p className="text-amber-800 text-sm font-medium text-center">
        Your account verification is pending. Your account is under verification. Please wait for admin approval.
      </p>
    </div>
  );
}
