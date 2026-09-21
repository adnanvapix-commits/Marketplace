import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  async headers() {
    return [
      // Static assets: cache aggressively
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Logo / public assets
      {
        source: "/logo.jpeg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      // Mutation + auth APIs: never cache
      {
        source: "/api/auth/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/admin/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/products/mutate",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/chat/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/profile/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/support/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/notifications/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@supabase/supabase-js",
      "@supabase/ssr",
      "zustand",
    ],
  },
};

export default nextConfig;
