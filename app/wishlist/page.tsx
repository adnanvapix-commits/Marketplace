"use client";

import { useEffect, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useWishlistStore } from "@/store/wishlistStore";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";
import Link from "next/link";

export default function WishlistPage() {
  const { items, toggle } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) { setLoading(false); setProducts([]); return; }
    const supabase = createClient();
    supabase
      .from("products")
      .select("*, users(email, company_name)")
      .in("id", items)
      .then(({ data }) => {
        // Keep order matching wishlist store
        const map = new Map((data ?? []).map(p => [p.id, p]));
        setProducts(items.map(id => map.get(id)).filter(Boolean) as Product[]);
        setLoading(false);
      });
  }, [items]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Heart size={22} className="text-red-500 fill-red-500" />
        Wishlist
        <span className="text-base font-normal text-gray-400">({items.length})</span>
      </h1>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="card flex gap-0 overflow-hidden h-20 animate-pulse">
              <div className="w-20 bg-cream-200 shrink-0" />
              <div className="flex-1 p-3 space-y-2">
                <div className="h-4 bg-cream-200 rounded w-3/4" />
                <div className="h-3 bg-cream-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-red-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">Your wishlist is empty</p>
          <p className="text-sm text-gray-400 mb-5">Save products you&apos;re interested in by tapping the heart icon</p>
          <Link href="/home" className="btn-primary text-sm inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
            </div>
          ))}

          {/* Clear all */}
          <div className="flex justify-end mt-2">
            <button
              onClick={() => items.forEach(id => toggle(id))}
              className="text-xs text-red-500 hover:underline flex items-center gap-1"
            >
              <Heart size={11} /> Clear all ({items.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
