"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Building2, Phone, Globe, CheckSquare, Square, Loader2, CheckCircle, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Profile {
  full_name?: string; company_name?: string; phone?: string; country?: string;
  roles?: string[]; role?: string; avatar_url?: string;
  is_verified?: boolean; is_subscribed?: boolean; verification_status?: string;
}

export default function AccountForm({ profile, email, userId }: { profile: Profile | null; email: string; userId: string }) {
  const router = useRouter();
  const existingRoles = profile?.roles ?? (profile?.role ? [profile.role] : ["buyer"]);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [companyName, setCompanyName] = useState(profile?.company_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [country, setCountry] = useState(profile?.country ?? "UAE");
  const [roles, setRoles] = useState<Set<string>>(new Set(existingRoles));
  const [roleError, setRoleError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleRole(r: string) {
    setRoleError("");
    setRoles((prev) => { const next = new Set(prev); if (next.has(r)) next.delete(r); else next.add(r); return next; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) { toast.error("Full name is required"); return; }
    if (!companyName.trim()) { toast.error("Company name is required"); return; }
    if (!phone.trim()) { toast.error("Phone number is required"); return; }
    if (!country.trim()) { toast.error("Country is required"); return; }
    if (roles.size === 0) { setRoleError("Select at least one role"); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const rolesArray = Array.from(roles);
      const { error } = await supabase.from("users").update({
        full_name: fullName.trim(), company_name: companyName.trim(),
        phone: phone.trim(), country: country.trim(),
        roles: rolesArray, role: rolesArray.includes("seller") ? "seller" : "buyer",
      }).eq("id", userId);
      if (error) throw error;
      setSaved(true); toast.success("Profile saved!");
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally { setLoading(false); }
  }

  const currentAvatar = profile?.avatar_url;

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-3">
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${profile?.is_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-600"}`}>
          {profile?.is_verified ? "✓ Verified" : "⏳ Pending Verification"}
        </span>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${profile?.is_subscribed ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          {profile?.is_subscribed ? "✓ Subscribed" : "No Subscription"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 sm:p-7 space-y-6">
        {/* Avatar — display only, no upload */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20">
            {profile?.avatar_url
              ? <Image src={profile.avatar_url} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" />
              : <span className="text-primary text-3xl font-bold">{(fullName || email)?.[0]?.toUpperCase()}</span>}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{fullName || email?.split("@")[0]}</p>
            <p className="text-xs text-gray-400">{email}</p>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <Lock size={11} /> Email Address
          </label>
          <input value={email} readOnly className="input min-h-[44px] bg-gray-50 text-gray-400 cursor-not-allowed text-sm" />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>

        {/* Full Name */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <User size={11} /> Full Name <span className="text-red-400">*</span>
          </label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="input min-h-[44px]" required />
        </div>

        {/* Company */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <Building2 size={11} /> Company Name <span className="text-red-400">*</span>
          </label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            className="input min-h-[44px]" required />
        </div>

        {/* Phone + Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Phone size={11} /> Phone <span className="text-red-400">*</span>
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="input min-h-[44px]" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <Globe size={11} /> Country <span className="text-red-400">*</span>
            </label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
              className="input min-h-[44px]" required />
          </div>
        </div>

        {/* Roles */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
            I want to <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            {[["buyer", "Buy Products", "Browse & purchase listings"], ["seller", "Sell Products", "List & sell your inventory"]].map(
              ([key, label, desc]) => (
                <button key={key} type="button" onClick={() => toggleRole(key)}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${roles.has(key) ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <span className="shrink-0">
                    {roles.has(key) ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} className="text-gray-300" />}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${roles.has(key) ? "text-primary" : "text-gray-700"}`}>{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </button>
              ))}
          </div>
          {roleError && <p className="text-xs text-red-500 mt-1">{roleError}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-2 text-base">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {saved && <CheckCircle size={16} />}
          {saved ? "Saved!" : loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
