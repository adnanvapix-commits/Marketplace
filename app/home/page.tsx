import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";
import type { Product } from "@/types";

export const metadata = { title: "Home | B2B Market" };

async function fetchTrending(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, users(email, company_name)")
      .eq("is_active", true)
      .eq("is_blocked", false)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) return [];
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

async function fetchRecent(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, users(email, company_name)")
      .eq("is_active", true)
      .eq("is_blocked", false)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) return [];
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [trending, recent] = await Promise.all([fetchTrending(), fetchRecent()]);

  return <HomeClient trendingProducts={trending} recentProducts={recent} />;
}
