"use client";

import type { Product } from "@/types";
import { useAuthStore } from "@/store/authStore";
import ModeToggle from "@/components/ModeToggle";
import QuickCategories from "./QuickCategories";
import TrendingSection from "./TrendingSection";
import RecentSection from "./RecentSection";

interface VerifiedHomeProps {
  trendingProducts: Product[];
  recentProducts: Product[];
}

export default function VerifiedHome({ trendingProducts, recentProducts }: VerifiedHomeProps) {
  const { selectedMode } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Mode Toggle */}
      <div className="flex flex-col items-center gap-3">
        <ModeToggle />
        <p className="text-gray-500 text-center text-sm">
          {selectedMode === "buy"
            ? "Browse products from suppliers"
            : "List your products and start selling"}
        </p>
      </div>

      {/* Quick Categories */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Categories</h2>
        <QuickCategories />
      </section>

      {/* Trending Products */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Trending Products</h2>
        <TrendingSection products={trendingProducts} />
      </section>

      {/* Recently Added */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Recently Added</h2>
        <RecentSection products={recentProducts} />
      </section>
    </div>
  );
}
