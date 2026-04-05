"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, CheckCircle, Camera, User } from "lucide-react";
import { uploadImage } from "@/lib/cloudinary";
import toast from "react-hot-toast";

interface Profile {
  full_name?: string; company_name?: string; phone?: string;
  country?: string; roles?: string[]; role?: string; avatar_url?: string;
  whatsapp_number?: string;
}

export default function EditProfileForm({ profile, email, userId }: {
  profile: Profile | null; email: string; userId: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [companyName, setCompanyName] = useState(profile?.company_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) { toast.error("Full name is required"); return; }

    setLoading(true);
    let finalAvatarUrl = avatarUrl;

    try {
      // Upload new avatar if selected and Cloudinary is configured
      if (avatarFile) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (cloudName && preset) {
          setUploading(true);
          try {
            finalAvatarUrl = await uploadImage(avatarFile);
          } catch (uploadErr) {
            console.error("Avatar upload error:", uploadErr);
            toast.error("Photo upload failed — saving profile without new photo");
          } finally {
            setUploading(false);
          }
        } else {
          toast("Photo upload skipped — Cloudinary not configured", { icon: "ℹ️" });
        }
      }

      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          company_name: companyName.trim() || undefined,
          phone: phone.trim() || undefined,
          country: country.trim() || undefined,
          avatar_url: finalAvatarUrl || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("[EditProfileForm] API error:", err);
        throw new Error(err.error ?? "Failed to update profile");
      }

      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
      setDone(true);
      toast.success("Profile updated!");
      setTimeout(() => router.push("/profile"), 1000);
    } catch (err: unknown) {
      console.error("handleSubmit error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  const displayAvatar = avatarPreview ?? (avatarUrl || null);

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-7 space-y-5">

      {/* Avatar upload */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">Profile Photo</label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {displayAvatar
                ? <Image src={displayAvatar} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" unoptimized={!!avatarPreview} />
                : <User size={28} className="text-primary" />
              }
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow hover:bg-primary/90 transition-colors"
              title="Change photo"
            >
              <Camera size={13} />
            </button>
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="text-sm text-primary font-medium hover:underline">
              {uploading ? "Uploading..." : "Change photo"}
            </button>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP · max 5MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        {avatarPreview && (
          <p className="text-xs text-amber-600 mt-2">New photo selected — will be saved when you click Save Changes</p>
        )}
      </div>

      {/* Email — read only */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
        <input type="email" value={email} readOnly className="input min-h-[44px] bg-gray-50 text-gray-400 cursor-not-allowed" />
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
      </div>

      {/* Full Name */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Full Name <span className="text-red-400">*</span>
        </label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
          className="input min-h-[44px]" required />
      </div>

      {/* Company */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Company / Shop Name</label>
        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
          className="input min-h-[44px]" placeholder="Optional" />
      </div>

      {/* Phone */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          className="input min-h-[44px]" placeholder="Optional" />
      </div>

      {/* Country */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Country</label>
        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
          className="input min-h-[44px]" placeholder="Optional" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit" disabled={loading || uploading}
          className="btn-primary flex-1 min-h-[48px] flex items-center justify-center gap-2">
          {(loading || uploading) && <Loader2 size={16} className="animate-spin" />}
          {done && <CheckCircle size={16} />}
          {done ? "Saved!" : (loading || uploading) ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline flex-1 min-h-[48px]">
          Cancel
        </button>
      </div>
    </form>
  );
}
