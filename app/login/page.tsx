"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, ShoppingBag, Store, CheckSquare, Square } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Multi-select roles
  const [roles, setRoles] = useState<Set<"buyer" | "seller">>(new Set());
  const [roleError, setRoleError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleRole(r: "buyer" | "seller") {
    setRoleError("");
    setRoles((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSignup && roles.size === 0) {
      setRoleError("Please select at least one option (Buy or Sell).");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          // Primary role: if both selected use "seller", else use selected
          const primaryRole = roles.has("seller") ? "seller" : "buyer";
          await supabase.from("users").upsert({
            id: data.user.id,
            email,
            role: primaryRole,
            roles: Array.from(roles), // store both roles
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Building2 size={26} className="text-primary" />
            <span className="text-2xl font-bold text-gray-900">B2B Market</span>
          </div>
          <p className="text-gray-500 text-sm">
            {isSignup ? "Create your business account" : "Sign in to your account"}
          </p>
        </div>

        <div className="card p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role checkboxes — signup only */}
            {isSignup && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  I want to <span className="text-red-400">*</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Buy */}
                  <button
                    type="button"
                    onClick={() => toggleRole("buyer")}
                    className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      roles.has("buyer")
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="shrink-0 text-primary">
                      {roles.has("buyer")
                        ? <CheckSquare size={20} />
                        : <Square size={20} className="text-gray-300" />
                      }
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-primary" />
                        <span className={`text-sm font-semibold ${roles.has("buyer") ? "text-primary" : "text-gray-700"}`}>
                          Buy Products
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Browse & purchase listings</p>
                    </div>
                  </button>

                  {/* Sell */}
                  <button
                    type="button"
                    onClick={() => toggleRole("seller")}
                    className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      roles.has("seller")
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="shrink-0 text-primary">
                      {roles.has("seller")
                        ? <CheckSquare size={20} />
                        : <Square size={20} className="text-gray-300" />
                      }
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Store size={14} className="text-primary" />
                        <span className={`text-sm font-semibold ${roles.has("seller") ? "text-primary" : "text-gray-700"}`}>
                          Sell Products
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">List & sell your inventory</p>
                    </div>
                  </button>
                </div>

                {/* Helper text */}
                <p className="text-xs text-gray-400 mt-2">
                  You can choose both if you want to buy and sell products.
                </p>

                {/* Validation error */}
                {roleError && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{roleError}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input min-h-[44px]" placeholder="you@company.com" required
              />
            </div>

            {/* Password */}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
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
              className="btn-primary w-full min-h-[48px] text-base mt-1"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsSignup(!isSignup); setRoles(new Set()); setRoleError(""); }}
              className="text-primary hover:underline font-medium">
              {isSignup ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
