"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, CheckCircle, XCircle, LogOut, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PendingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Admin bypass
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
    if (user.email === adminEmail) { router.push("/admin"); return; }

    const { data } = await supabase
      .from("users")
      .select("verification_status, is_verified, is_subscribed, role")
      .eq("id", user.id)
      .single();

    if (data?.role === "admin") { router.push("/admin"); return; }

    if (data?.is_verified && data?.is_subscribed) {
      router.push("/dashboard");
      return;
    }

    if (data?.is_verified && !data?.is_subscribed) {
      router.push("/subscribe");
      return;
    }

    if (data?.verification_status) {
      setStatus(data.verification_status as "pending" | "approved" | "rejected");
    }

    setLoading(false);
    setChecking(false);
  }, [router]);

  // Initial check
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Auto-poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  async function handleManualCheck() {
    setChecking(true);
    await checkStatus();
    toast.success("Status refreshed");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/");
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-8 text-center">

        {status === "pending" && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-yellow-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Verification Pending</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your account is under review. Once the admin approves your account,
              you&apos;ll be redirected automatically.
            </p>
            <button
              onClick={handleManualCheck}
              disabled={checking}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
            >
              <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
              {checking ? "Checking..." : "Check Status"}
            </button>
            <p className="text-xs text-gray-400">Auto-checks every 10 seconds</p>
          </>
        )}

        {status === "approved" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Account Approved!</h1>
            <p className="text-gray-500 text-sm mb-4">
              Your account has been verified. You need an active subscription to access the marketplace.
            </p>
            <button onClick={() => router.push("/subscribe")} className="btn-primary w-full">
              View Subscription Plans
            </button>
          </>
        )}

        {status === "rejected" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Verification Rejected</h1>
            <p className="text-gray-500 text-sm">
              Your account verification was rejected. Please contact support.
            </p>
          </>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mx-auto"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}
