"use client";

import type { Product } from "@/types";
import { useAuthStore } from "@/store/authStore";
import VerificationBanner from "./VerificationBanner";
import LockedHome from "./LockedHome";
import VerifiedHome from "./VerifiedHome";

interface HomeClientProps {
  trendingProducts: Product[];
  recentProducts: Product[];
}

export default function HomeClient({ trendingProducts, recentProducts }: HomeClientProps) {
  const { isVerified } = useAuthStore();

  if (!isVerified) {
    return (
      <>
        <VerificationBanner />
        <LockedHome />
      </>
    );
  }

  return (
    <VerifiedHome
      trendingProducts={trendingProducts}
      recentProducts={recentProducts}
    />
  );
}
