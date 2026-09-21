"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, ImagePlus, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { CATEGORIES, CONDITIONS } from "@/types";
import { uploadImage } from "@/lib/cloudinary";
import Image from "next/image";
import toast from "react-hot-toast";

export default function SellPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("Dubai, UAE");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [moq, setMoq] = useState("1");
  const [condition, setCondition] = useState<"new" | "used" | "refurbished">("new");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Please login first"); router.push("/login"); return; }

    setLoading(true);
    try {
      // Upload image first if selected
      let imageUrl = "";
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } catch {
          toast.error("Image upload failed. Listing without image.");
        } finally {
          setUploadingImage(false);
        }
      }

      const res = await fetch("/api/products/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, price, category, location,
          brand, quantity, minimum_order_quantity: moq,
          condition, image_url: imageUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error === "Account not verified") {
          toast.error("Your account needs to be verified before you can publish listings.");
        } else {
          throw new Error(err.error ?? "Failed to list product");
        }
        return;
      }

      setDone(true);
      toast.success("Product listed!");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to list product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Post a Listing</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in your product details for B2B buyers</p>

        <form onSubmit={handleSubmit} className="card p-5 sm:p-7 space-y-5">

          {/* Product Image */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Product Image <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            {imagePreview ? (
              <div className="relative w-48 h-48 shrink-0">
                <Image src={imagePreview} alt="Preview" fill
                  className="rounded-xl object-cover border border-cream-200" />
                <button type="button" onClick={clearImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors z-10">
                  <X size={12} />
                </button>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center z-10">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-cream-300 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-cream-50 transition-colors">
                <ImagePlus size={28} className="text-gray-300 mb-2" />
                <span className="text-sm text-gray-400">Click to upload</span>
                <span className="text-xs text-gray-300 mt-0.5">1:1 square image</span>
                <span className="text-xs text-gray-300">PNG, JPG up to 10MB</span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Product Title <span className="text-red-400">*</span>
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="input min-h-[44px]" required maxLength={100} placeholder="e.g. iPhone 15 Pro Max 256GB" />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="input resize-none" rows={4} required
              placeholder="Describe your product, specifications, packaging, etc." />
          </div>

          {/* Brand + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Brand</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                className="input min-h-[44px]" placeholder="e.g. Apple, Samsung" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Category <span className="text-red-400">*</span>
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="input min-h-[44px]" required>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Condition <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {CONDITIONS.map((c) => (
                <button key={c} type="button" onClick={() => setCondition(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all capitalize ${
                    condition === c
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price, Qty, MOQ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Unit Price (AED) <span className="text-red-400">*</span>
              </label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="input min-h-[44px]" min={0} step={0.01} required placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Available Qty <span className="text-red-400">*</span>
              </label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="input min-h-[44px]" min={1} required placeholder="1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Min. Order Qty</label>
              <input type="number" value={moq} onChange={(e) => setMoq(e.target.value)}
                className="input min-h-[44px]" min={1} placeholder="1" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Location / Origin</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              className="input min-h-[44px]" />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-2 text-base">
            {(loading || uploadingImage) && <Loader2 size={18} className="animate-spin" />}
            {done && <CheckCircle size={18} />}
            {uploadingImage ? "Uploading image..." : loading ? "Saving..." : done ? "Listed!" : "Post Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
