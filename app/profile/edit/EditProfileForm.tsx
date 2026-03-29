"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckSquare, Square, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Profile {
  full_name?: string; company_name?: string; phone?: string;
  country?: string; roles?: string[]; role?: string; avatar_url?: string;
}

export default function EditProfileForm({ profile, email, userId }: { profile: Profile | null; email: string; userId: string }) {
  const router = useRouter();
  const existingRoles = profile?.roles ?? (profile?.role ? [profile.role] : ["buyer"]);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [companyName, setCompanyName] = useState(profile?.company_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [country, setCountry] = useState(profile?.country ?? "UAE");
  const [roles, setRoles] = useState<Set<string>>(new Set(existingRoles));
  const [roleError, setRoleError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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
      setDone(true); toast.success("Profile updated!");
      setTimeout(() => router.push("/profile"), 1000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally { setLoading(false); }
  }

  const currentAvatar = profile?.avatar_url;

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-7 space-y-5">
      {/* Avatar — display only */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">Profile Photo</label>
        <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
          {profile?.avatar_url
            ? <Image src={profile.avatar_url} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" />
            : <span className="text-primary text-3xl font-bold">{(fullName || email)?.[0]?.toUpperCase()}</span>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
        <input type="email" value={email} readOnly className="input min-h-[44px] bg-gray-50 text-gray-400 cursor-not-allowed" />
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
      </div>

      {/* Full Name */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Full Name <span className="text-red-400">*</span></label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input min-h-[44px]" required />
      </div>

      {/* Company */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Company Name <span className="text-red-400">*</span></label>
        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input min-h-[44px]" required />
      </div>

      {/* Phone + Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Phone <span className="text-red-400">*</span></label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input min-h-[44px]" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Country <span className="text-red-400">*</span></label>
          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="input min-h-[44px]" required />
        </div>
      </div>

      {/* Roles */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">I want to <span className="text-red-400">*</span></label>
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
        {roleError && <p className="text-xs text-red-500 mt-1 font-medium">{roleError}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="btn-primary flex-1 min-h-[48px] flex items-center justify-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {done && <CheckCircle size={16} />}
          {done ? "Saved!" : loading ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline flex-1 min-h-[48px]">Cancel</button>
      </div>
    </form>
  );
}
