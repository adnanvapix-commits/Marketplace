"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateAvatarDataUri } from "@/lib/utils/generateAvatar";
import toast from "react-hot-toast";

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
const WHATSAPP_REGEX = /^\+?[1-9]\d{6,14}$/;

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  function validateWhatsapp(value: string): boolean {
    if (!WHATSAPP_REGEX.test(value)) {
      setWhatsappError("Enter a valid WhatsApp number (e.g. +971501234567)");
      return false;
    }
    setWhatsappError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSignup && !validateWhatsapp(whatsapp)) return;

    setLoading(true);
    const supabase = createClient();
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from("users").upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            whatsapp_number: whatsapp,
            roles: ["buyer", "seller"],
            role: "buyer",
            is_verified: false,
            verification_status: "pending",
            avatar_url: generateAvatarDataUri(fullName, email),
            ...(companyName ? { company_name: companyName } : {}),
          });
        }
        toast.success("Account created! Welcome to B2B Market.");
        router.push("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Small delay to ensure session cookie is set
        await new Promise((r) => setTimeout(r, 300));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile?.role === "admin" || user.email === adminEmail) {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
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

            {isSignup && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input min-h-[44px]"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input min-h-[44px]"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input min-h-[44px] pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    WhatsApp Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => {
                      setWhatsapp(e.target.value);
                      if (whatsappError) validateWhatsapp(e.target.value);
                    }}
                    placeholder="+971501234567"
                    className="input min-h-[44px]"
                    required
                  />
                  {whatsappError && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{whatsappError}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Company / Shop Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input min-h-[44px]"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full min-h-[48px] text-base mt-1"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setWhatsappError("");
              }}
              className="text-primary hover:underline font-medium"
            >
              {isSignup ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
