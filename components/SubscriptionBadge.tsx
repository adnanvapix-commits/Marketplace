import type { SubscriptionTier } from "@/types";

const TIER_CONFIG = {
  elite: {
    label: "Elite",
    icon: "👑",
    cls: "bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 border border-amber-400 shadow-sm",
    dot: "bg-amber-500",
  },
  expert: {
    label: "Expert",
    icon: "⭐",
    cls: "bg-gradient-to-r from-slate-300 to-gray-200 text-slate-700 border border-slate-300 shadow-sm",
    dot: "bg-slate-400",
  },
  beginner: {
    label: "Beginner",
    icon: "🥉",
    cls: "bg-gradient-to-r from-orange-200 to-amber-100 text-orange-800 border border-orange-300 shadow-sm",
    dot: "bg-orange-400",
  },
};

interface Props {
  tier: SubscriptionTier;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export default function SubscriptionBadge({ tier, size = "md", showIcon = true }: Props) {
  if (!tier) return null;

  const config = TIER_CONFIG[tier];

  const sizeClass = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  }[size];

  return (
    <span className={`inline-flex items-center font-bold rounded-full ${sizeClass} ${config.cls}`}>
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}
