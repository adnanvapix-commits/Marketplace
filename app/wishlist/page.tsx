"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useWishlistStore } from "@/store/wishlistStore";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return; }

    const supabase = createClient();
    supabase
      .from("products")
      .select("*")
      .in("id", items)
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Heart size={24} className="text-red-500 fill-red-500" /> Wishlist
        <span className="text-base font-normal text-gray-400">({items.length})</span>
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Heart size={48} className="mx-auto mb-3 opacity-30" />
          <p>Your wishlist is empty</p>
        </div>
      ) : (
        <ProductGrid products={products} loading={loading} />
      )}
    </div>
  );
}
