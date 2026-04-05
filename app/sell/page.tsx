"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
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
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Please login first"); router.push("/login"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/products/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price, category, location, brand, quantity, minimum_order_quantity: moq, condition }),
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
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Product Title <span className="text-red-400">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="input min-h-[44px]" required maxLength={100} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description <span className="text-red-400">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="input resize-none" rows={4} required />
          </div>

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
    </div>
  );
}
