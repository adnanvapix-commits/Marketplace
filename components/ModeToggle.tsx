"use client";

import { ShoppingCart, Tag } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface ModeToggleProps {
  disabled?: boolean;
}

export default function ModeToggle({ disabled }: ModeToggleProps) {
  const { selectedMode, setSelectedMode } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleBuy = () => {
    if (disabled) return;
    setSelectedMode("buy");
    if (pathname !== "/buy") router.push("/buy");
  };

  const handleSell = () => {
    if (disabled) return;
    setSelectedMode("sell");
    if (pathname !== "/sell") router.push("/sell");
  };

  return (
    <div
      className={`bg-gray-100 rounded-full p-1 flex relative w-72 h-14 ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {/* Sliding pill */}
      <div
        className="absolute inset-y-1 w-1/2 bg-white rounded-full shadow transition-transform duration-300 ease-in-out"
        style={{ transform: selectedMode === "sell" ? "translateX(100%)" : "translateX(0)" }}
      />

      {/* Buy button */}
      <button
        onClick={handleBuy}
        className="flex-1 flex items-center justify-center gap-2 z-10 relative text-sm font-semibold"
      >
        <ShoppingCart size={16} />
        Buy
      </button>

      {/* Sell button */}
      <button
        onClick={handleSell}
        className="flex-1 flex items-center justify-center gap-2 z-10 relative text-sm font-semibold"
      >
        <Tag size={16} />
        Sell
      </button>
    </div>
  );
}
