"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CONDITIONS } from "@/types";
import toast from "react-hot-toast";

export default function SellPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isVerified = useAuthStore((s) => s.isVerified);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("Dubai, UAE");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [moq, setMoq] = useState("1");
  const [condition, setCondition] = useState<"new" | "used" | "refurbished">("new");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Please login first"); router.push("/login"); return; }
    if (!isVerified) { setShowVerifyModal(true); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").insert({
        user_id: user.id,
        title, description,
        price: parseFloat(price),
        category, location, brand,
        quantity: parseInt(quantity),
        minimum_order_quantity: parseInt(moq),
        condition,
        image_url: "", // no image required
        is_active: true,
      });
      if (error) throw error;
      setDone(true);
      toast.success("Product listed!");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to list product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Post a Listing</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in your product details for B2B buyers</p>

        <form onSubmit={handleSubmit} className="card p-5 sm:p-7 space-y-5">

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
                className="input min-h-[44px]" min={0} step={0.01} required />
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
              className="input min-h-[44px]" />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-2 text-base">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {done && <CheckCircle size={18} />}
            {done ? "Listed!" : loading ? "Saving..." : "Post Listing"}
          </button>
        </form>
      </div>

      {/* Verification Required Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Required</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your account needs to be verified before you can publish listings.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/account"
                className="btn-primary w-full min-h-[44px] flex items-center justify-center text-sm font-medium"
              >
                Complete Verification
              </Link>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="w-full min-h-[44px] rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
