"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/cloudinary";
import { CATEGORIES, CONDITIONS } from "@/types";
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
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "uploading" | "saving" | "done">("idle");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Please login first"); router.push("/login"); return; }
    if (!imageFile) { toast.error("Please select an image"); return; }
    setLoading(true);
    setStep("uploading");
    try {
      const imageUrl = await uploadImage(imageFile);
      setStep("saving");
      const supabase = createClient();
      const { error } = await supabase.from("products").insert({
        user_id: user.id,
        title, description,
        price: parseFloat(price),
        category, location, brand,
        quantity: parseInt(quantity),
        minimum_order_quantity: parseInt(moq),
        condition,
        image_url: imageUrl,
        is_active: true,
      });
      if (error) throw error;
      setStep("done");
      toast.success("Product listed!");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to list product");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  }

  const stepLabel =
    step === "uploading" ? "Uploading image..." :
    step === "saving" ? "Saving listing..." :
    step === "done" ? "Listed!" : "Post Listing";

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Post a Listing</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in your product details for B2B buyers</p>

        <form onSubmit={handleSubmit} className="card p-5 sm:p-7 space-y-5">

          {/* Image */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Product Image <span className="text-red-400">*</span>
            </label>
            {preview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                <Image src={preview} alt="Preview" fill className="object-cover" />
                <button type="button" onClick={() => { setPreview(null); setImageFile(null); }}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow min-w-[36px] min-h-[36px] flex items-center justify-center">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-all">
                <Upload size={28} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload product image</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Product Title <span className="text-red-400">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="input min-h-[44px]" required maxLength={100} />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description <span className="text-red-400">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="input resize-none" rows={4} required />
          </div>

          {/* Brand + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Brand</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                className="input min-h-[44px]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category <span className="text-red-400">*</span></label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input min-h-[44px]" required>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Condition <span className="text-red-400">*</span></label>
            <div className="flex gap-2 flex-wrap">
              {CONDITIONS.map((c) => (
                <button key={c} type="button" onClick={() => setCondition(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all capitalize ${
                    condition === c ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price + Quantity + MOQ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Unit Price ($) <span className="text-red-400">*</span></label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="input min-h-[44px]" placeholder="0.00" min={0} step={0.01} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Available Qty <span className="text-red-400">*</span></label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="input min-h-[44px]" min={1} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Min. Order Qty</label>
              <input type="number" value={moq} onChange={(e) => setMoq(e.target.value)}
                className="input min-h-[44px]" min={1} />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Location / Origin</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              className="input min-h-[44px]" placeholder="e.g. Shenzhen, China" />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-2 text-base">
            {loading && step !== "done" && <Loader2 size={18} className="animate-spin" />}
            {step === "done" && <CheckCircle size={18} />}
            {stepLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
