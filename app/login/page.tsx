"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Building2, ShieldCheck } from "lucide-react";
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
        toast.success("Account created! Welcome to BULKORA.");
        router.push("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await new Promise((r) => setTimeout(r, 300));
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("users").select("role").eq("id", user.id).single();
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
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #FFFDF7 0%, #FFF9EC 60%, #FFF3D6 100%)" }}>

      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-hero-gradient px-10 py-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #F0CC70 0%, transparent 70%)" }} />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #B8860B 0%, transparent 70%)" }} />

        {/* Logo */}
        <div>
          <Link href="/" className="flex items-center gap-2 mb-12">
            <span className="text-2xl font-bold text-white tracking-tight">BULKORA</span>
          </Link>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your gateway to<br />
            <span className="text-gold-gradient">verified trade.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Join thousands of businesses sourcing and selling on the most trusted B2B marketplace in the region.
          </p>
        </div>

        {/* Trust points */}
        <div className="space-y-3">
          {[
            { icon: ShieldCheck, text: "Admin-verified sellers & buyers" },
            { icon: Building2,   text: "3,500+ active businesses" },
            { icon: ArrowRight,  text: "Free to register — no credit card" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon size={13} className="text-amber-300" />
              </div>
              <p className="text-sm text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-gold-gradient">BULK</span>
                <span className="text-gray-800">ORA</span>
              </span>
            </Link>
          </div>

          <div className="card p-7 shadow-cream-md border-cream-200">
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {isSignup ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isSignup
                  ? "Register your business and get verified"
                  : "Sign in to your BULKORA account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {isSignup && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input min-h-[44px]"
                    placeholder="John Smith"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input min-h-[44px]"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input min-h-[44px] pr-10"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary p-1 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isSignup && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
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
                      <p className="text-xs text-red-500 mt-1.5 font-medium">{whatsappError}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Company / Shop Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="input min-h-[44px]"
                      placeholder="Optional"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full min-h-[48px] text-sm mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isSignup ? "Create Account" : "Sign In"}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cream-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">or</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => { setIsSignup(!isSignup); setWhatsappError(""); }}
                className="text-primary hover:underline font-semibold"
              >
                {isSignup ? "Sign In" : "Register Free"}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            By continuing, you agree to BULKORA&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
