"use client";

import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

interface TrendingSectionProps {
  products: Product[];
  loading?: boolean;
}

export default function TrendingSection({ products, loading }: TrendingSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">No trending products yet</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {products.slice(0, 6).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
