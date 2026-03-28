"use client";

import { useState, useTransition } from "react";
import { ShoppingBag, PlusCircle, Search, Upload, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchProducts } from "@/lib/services/productService";
import { createProduct } from "@/lib/services/productService";
import { useAuthStore } from "@/store/authStore";
import { CATEGORIES } from "@/types";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface Props {
  initialProducts: Product[];
}

export default function HomeToggle({ initialProducts }: Props) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

      {/* Toggle — full width on mobile, centered pill on desktop */}
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="relative bg-gray-100 rounded-full p-1 flex w-full max-w-xs sm:max-w-sm">
          {/* Sliding pill */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full shadow transition-transform duration-300 ease-in-out ${
              tab === "sell" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
            }`}
          />
          <button
            onClick={() => setTab("buy")}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-colors duration-200 min-h-[44px] ${
              tab === "buy" ? "text-white" : "text-gray-500"
            }`}
          >
            <ShoppingBag size={15} /> Buy
          </button>
          <button
            onClick={() => setTab("sell")}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-colors duration-200 min-h-[44px] ${
              tab === "sell" ? "text-white" : "text-gray-500"
            }`}
          >
            <PlusCircle size={15} /> Sell
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="relative">
        <div className={`transition-all duration-300 ${
          tab === "buy" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 absolute inset-0 pointer-events-none"
        }`}>
          <BuySection initialProducts={initialProducts} />
        </div>
        <div className={`transition-all duration-300 ${
          tab === "sell" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 absolute inset-0 pointer-events-none"
        }`}>
          <SellSection />
        </div>
      </div>
    </div>
  );
}

/* ── BUY SECTION ── */
function BuySection({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const result = await fetchProducts({
        q: query.trim() || undefined,
        category: category || undefined,
        min: minPrice ? parseFloat(minPrice) : undefined,
        max: maxPrice ? parseFloat(maxPrice) : undefined,
        sort: "newest",
        pageSize: 12,
      });
      startTransition(() => setProducts(result.products));
    } catch { /* keep existing */ }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Search + filters card */}
      <form onSubmit={handleSearch} className="card p-3 sm:p-4 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="input pl-10 min-h-[44px] text-sm"
          />
        </div>

        {/* Filters — wrap on mobile */}
        <div className="flex flex-wrap gap-2">
          <select
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="input flex-1 min-w-[130px] text-sm min-h-[44px]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="number" placeholder="Min $" value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input w-20 sm:w-24 text-sm min-h-[44px]" min={0}
          />
          <input
            type="number" placeholder="Max $" value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input w-20 sm:w-24 text-sm min-h-[44px]" min={0}
          />
          <button type="submit" className="btn-primary text-sm px-5 min-h-[44px] flex-1 sm:flex-none">
            Search
          </button>
        </div>
      </form>

      {/* Results header */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{products.length} listings</p>
          <button onClick={() => router.push("/buy")} className="text-primary text-sm hover:underline">
            View all →
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingBag size={44} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

/* ── SELL SECTION ── */
function SellSection() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Please login first"); router.push("/login"); return; }
    if (!imageFile) { toast.error("Please select an image"); return; }
    setLoading(true);
    try {
      await createProduct(user.id, { title, description, price: parseFloat(price), category, location, imageFile });
      toast.success("Product listed!");
      setTitle(""); setDescription(""); setPrice(""); setCategory("");
      setLocation(""); setImageFile(null); setPreview(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to list product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="card p-4 sm:p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">List an Item for Sale</h2>

        {/* Image */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Product Image *</label>
          {preview ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
              <Image src={preview} alt="Preview" fill className="object-cover" />
              <button type="button" onClick={() => { setPreview(null); setImageFile(null); }}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
              <Upload size={26} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Tap to upload image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="input min-h-[44px]" placeholder="e.g. iPhone 14 Pro Max" required />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className="input resize-none" rows={3} placeholder="Describe your item..." required />
        </div>

        {/* Price & Category — single col on xs, two cols on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Price ($) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              className="input min-h-[44px]" placeholder="0.00" min={0} step={0.01} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="input min-h-[44px]" required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Location (optional)</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            className="input min-h-[44px]" placeholder="e.g. New York, NY" />
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-2 text-sm sm:text-base">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Listing..." : "Post Listing"}
        </button>
      </form>
    </div>
  );
}
