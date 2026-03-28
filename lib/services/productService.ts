import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/cloudinary";
import type { Product } from "@/types";

export interface ProductFilters {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
}

export interface ProductsResult {
  products: Product[];
  count: number;
  totalPages: number;
}

/** Fetch paginated + filtered products from Supabase */
export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsResult> {
  const supabase = createClient();
  const { q, category, min, max, sort = "newest", page = 1, pageSize = 12 } = filters;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("products").select("*", { count: "exact" });

  // Case-insensitive title search
  if (q?.trim()) query = query.ilike("title", `%${q.trim()}%`);
  if (category) query = query.eq("category", category);
  if (min !== undefined) query = query.gte("price", min);
  if (max !== undefined) query = query.lte("price", max);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return {
    products: (data as Product[]) ?? [],
    count: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/** Fetch a single product with seller info */
export async function fetchProduct(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, users(email)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Product;
}

/** Upload image to Cloudinary then insert product into Supabase */
export async function createProduct(
  userId: string,
  fields: {
    title: string;
    description: string;
    price: number;
    category: string;
    location?: string;
    imageFile: File;
  }
): Promise<void> {
  const imageUrl = await uploadImage(fields.imageFile);

  const supabase = createClient();
  const { error } = await supabase.from("products").insert({
    user_id: userId,
    title: fields.title,
    description: fields.description,
    price: fields.price,
    category: fields.category,
    location: fields.location ?? "",
    image_url: imageUrl,
  });

  if (error) throw new Error(error.message);
}

/** Delete a product (RLS ensures only owner can delete) */
export async function deleteProduct(productId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
}
