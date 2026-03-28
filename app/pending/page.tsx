"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PendingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("users")
        .select("verification_status, is_verified, is_subscribed")
        .eq("id", user.id)
        .single();
      if (data?.is_verified && data?.is_subscribed) {
        router.push("/dashboard");
      } else if (data?.verification_status) {
        setStatus(data.verification_status);
      }
      setLoading(false);
    });
  }, [router]);

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
            <p className="text-gray-500 text-sm leading-relaxed">
              Your account is under review. Our team will verify your business details within 24–48 hours.
              You&apos;ll receive access once approved.
            </p>
          </>
        )}
        {status === "approved" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Account Approved!</h1>
            <p className="text-gray-500 text-sm mb-4">
              Your account has been verified. You now need an active subscription to access the marketplace.
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
              Your account verification was rejected. Please contact support for more information.
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
