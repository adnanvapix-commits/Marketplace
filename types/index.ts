export interface User {
  id: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  is_verified: boolean;
  is_subscribed: boolean;
  is_blocked: boolean;
  subscription_expiry: string | null;
  verification_status: "pending" | "approved" | "rejected";
  company_name?: string;
  phone?: string;
  country?: string;
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
  users?: { email: string; company_name?: string };
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
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = ["new", "used", "refurbished"] as const;
export type Condition = (typeof CONDITIONS)[number];
