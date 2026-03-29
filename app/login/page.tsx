"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Update profile with B2B fields
        if (data.user) {
          await supabase.from("users").upsert({
            id: data.user.id,
            email,
            role,
            company_name: companyName,
            phone,
            country,
            verification_status: "pending",
            is_verified: false,
          });
        }

        toast.success("Account created! Awaiting admin verification.");
        router.push("/pending");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check verification status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("is_verified, is_subscribed, role")
            .eq("id", user.id)
            .single();

          if (profile?.role === "admin" || user.email === adminEmail) {
            router.push("/admin");
          } else if (!profile?.is_verified) {
            router.push("/pending");
          } else if (!profile?.is_subscribed) {
            router.push("/subscribe");
          } else {
            router.push("/dashboard");
          }
          router.refresh();
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Building2 size={28} className="text-primary" />
            <span className="text-2xl font-bold text-gray-900">B2B Market</span>
          </div>
          <p className="text-gray-500 text-sm">
            {isSignup ? "Create your business account" : "Sign in to your account"}
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector — signup only */}
            {isSignup && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">I want to</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["buyer", "seller"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        role === r
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <User size={16} />
                      {r === "buyer" ? "Buy Products" : "Sell Products"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input min-h-[44px]" placeholder="you@company.com" required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input min-h-[44px] pr-10" placeholder="••••••••"
                  required minLength={6}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* B2B signup fields */}
            {isSignup && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    className="input min-h-[44px]" placeholder="Your Company Ltd." required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                    <input
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="input min-h-[44px]" placeholder="+1 234 567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Country</label>
                    <input
                      type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                      className="input min-h-[44px]" placeholder="USA"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full min-h-[48px] text-base mt-2"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary hover:underline font-medium">
              {isSignup ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
