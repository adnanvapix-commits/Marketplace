"use client";

import { useEffect } from "react";

// Fires once on mount to increment view count — no UI rendered
export default function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    fetch("/api/products/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    }).catch(() => {});
  }, [productId]);

  return null;
}
