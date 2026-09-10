export type SubscriptionTier = "elite" | "expert" | "beginner" | null;

export interface User {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  role: "buyer" | "seller" | "admin";
  roles?: string[];
  is_verified: boolean;
  is_subscribed: boolean;
  is_blocked: boolean;
  subscription_expiry: string | null;
  subscription_tier: SubscriptionTier;
  verification_status: "pending" | "approved" | "rejected";
  company_name?: string;
  phone?: string;
  whatsapp_number?: string;
  country?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  location?: string;
  quantity: number;
  condition: "new" | "used" | "refurbished";
  brand?: string;
  minimum_order_quantity: number;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  users?: {
    email: string;
    company_name?: string;
    subscription_tier?: SubscriptionTier;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  message: string;
  created_at: string;
}

export const CATEGORIES = [
  "Electronics",
  "Clothing & Apparel",
  "Food & Beverages",
  "Construction Materials",
  "Machinery & Equipment",
  "Chemicals",
  "Automotive",
  "Medical Supplies",
  "Furniture",
  "Packaging",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = ["new", "used", "refurbished"] as const;
export type Condition = (typeof CONDITIONS)[number];

/** Internal tier priority — higher number = shown later */
export const TIER_RANK: Record<string, number> = {
  elite: 1,
  expert: 2,
  beginner: 3,
};
