import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 16;

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user is allowed (verified + subscribed, or admin)
  const { data: profile } = await supabase
    .from("users")
    .select("is_verified, is_subscribed, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const hasAccess = isAdmin || (profile?.is_verified && profile?.is_subscribed);
  if (!hasAccess) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  // Parse query params
  const sp = req.nextUrl.searchParams;
  const q         = sp.get("q")?.trim() || "";
  const category  = sp.get("category") || "";
  const condition = sp.get("condition") || "";
  const brand     = sp.get("brand")?.trim() || "";
  const location  = sp.get("location")?.trim() || "";
  const minPrice  = sp.get("minPrice") ? parseFloat(sp.get("minPrice")!) : null;
  const maxPrice  = sp.get("maxPrice") ? parseFloat(sp.get("maxPrice")!) : null;
  const minQty    = sp.get("minQty") ? parseInt(sp.get("minQty")!) : null;
  const minMoq    = sp.get("minMoq") ? parseInt(sp.get("minMoq")!) : null;
  const sort      = sp.get("sort") || "newest";
  const page      = Math.max(1, parseInt(sp.get("page") || "1"));
  const from      = (page - 1) * PAGE_SIZE;
  const to        = from + PAGE_SIZE - 1;

  // Build dynamic query
  let query = supabase
    .from("products")
    .select("*, users(email, company_name)", { count: "exact" })
    .eq("is_active", true)
    .eq("is_blocked", false);

  // Text search — title OR brand
  if (q) {
    query = query.or(`title.ilike.%${q}%,brand.ilike.%${q}%`);
  }
  if (category)  query = query.eq("category", category);
  if (condition) query = query.eq("condition", condition);
  if (brand)     query = query.ilike("brand", `%${brand}%`);
  if (location)  query = query.ilike("location", `%${location}%`);
  if (minPrice !== null) query = query.gte("price", minPrice);
  if (maxPrice !== null) query = query.lte("price", maxPrice);
  if (minQty !== null)   query = query.gte("quantity", minQty);
  if (minMoq !== null)   query = query.lte("minimum_order_quantity", minMoq);

  // Sorting
  if (sort === "price_asc")  query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "qty_desc")   query = query.order("quantity", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, count, error } = await query.range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Normalize users array to object (Supabase join returns array)
  const products = (data ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    users: Array.isArray(p.users) ? p.users[0] ?? null : p.users,
  }));

  return NextResponse.json(
    { products, count: count ?? 0, totalPages: Math.ceil((count ?? 0) / PAGE_SIZE), page },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
  );
}
