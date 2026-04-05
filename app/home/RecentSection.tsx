"use client";

import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

interface RecentSectionProps {
  products: Product[];
  loading?: boolean;
}

export default function RecentSection({ products, loading }: RecentSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">No recent products yet</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
