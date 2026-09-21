import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 16;

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // ── Auth — JWT only, zero DB call ─────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meta = user.user_metadata ?? {};
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  const isAdmin = meta.role === "admin" || user.email === adminEmail;

  // Always verify subscription/verification via DB — user_metadata is user-writable
  // and cannot be trusted for access control decisions
  let hasAccess = isAdmin;
  if (!hasAccess) {
    const { data: profile } = await supabase
      .from("users").select("is_verified, is_subscribed, role").eq("id", user.id).single();
    hasAccess = profile?.role === "admin" || (!!profile?.is_verified && !!profile?.is_subscribed);
  }

  if (!hasAccess) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  // ── Parse params ───────────────────────────────────────────────────────
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1"));

  // ── Single DB call via RPC — tier sort + real pagination in SQL ────────
  const { data: rpcResult, error } = await supabase.rpc("search_products_tiered", {
    p_q:         sp.get("q")?.trim()        || "",
    p_category:  sp.get("category")         || "",
    p_condition: sp.get("condition")        || "",
    p_brand:     sp.get("brand")?.trim()    || "",
    p_location:  sp.get("location")?.trim() || "",
    p_min_price: sp.get("minPrice") ? parseFloat(sp.get("minPrice")!) : null,
    p_max_price: sp.get("maxPrice") ? parseFloat(sp.get("maxPrice")!) : null,
    p_min_qty:   sp.get("minQty")   ? parseInt(sp.get("minQty")!)     : null,
    p_min_moq:   sp.get("minMoq")   ? parseInt(sp.get("minMoq")!)     : null,
    p_sort:      sp.get("sort") || "alpha",
    p_page:      page,
    p_page_size: PAGE_SIZE,
  });

  if (error) {
    // RPC not yet deployed — fall back to direct query
    return fallbackSearch(supabase, sp, page);
  }

  const result = rpcResult as {
    products: unknown[];
    count: number;
    totalPages: number;
    page: number;
  };

  const res = NextResponse.json(result);
  // Cache on Vercel CDN edge for 30s — now this actually works (global override removed)
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
}

// ── Fallback: direct query (used if RPC not yet deployed in Supabase) ────
async function fallbackSearch(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  sp: URLSearchParams,
  page: number
) {
  const PAGE_SIZE = 16;
  const TIER_PRIORITY: Record<string, number> = { elite: 1, expert: 2, beginner: 3 };

  let query = supabase
    .from("products")
    .select("*, users(email, company_name, subscription_tier)", { count: "exact" })
    .eq("is_active", true)
    .eq("is_blocked", false);

  const q        = sp.get("q")?.trim() || "";
  const category = sp.get("category") || "";
  const condition= sp.get("condition") || "";
  const brand    = sp.get("brand")?.trim() || "";
  const location = sp.get("location")?.trim() || "";
  const minPrice = sp.get("minPrice") ? parseFloat(sp.get("minPrice")!) : null;
  const maxPrice = sp.get("maxPrice") ? parseFloat(sp.get("maxPrice")!) : null;
  const minQty   = sp.get("minQty")   ? parseInt(sp.get("minQty")!)     : null;
  const minMoq   = sp.get("minMoq")   ? parseInt(sp.get("minMoq")!)     : null;
  const sort     = sp.get("sort") || "alpha";

  if (q)         query = query.or(`title.ilike.%${q}%,brand.ilike.%${q}%`);
  if (category)  query = query.eq("category", category);
  if (condition) query = query.eq("condition", condition);
  if (brand)     query = query.ilike("brand", `%${brand}%`);
  if (location)  query = query.ilike("location", `%${location}%`);
  if (minPrice !== null) query = query.gte("price", minPrice);
  if (maxPrice !== null) query = query.lte("price", maxPrice);
  if (minQty !== null)   query = query.gte("quantity", minQty);
  if (minMoq !== null)   query = query.lte("minimum_order_quantity", minMoq);

  if (sort === "price_asc")       query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "qty_desc")   query = query.order("quantity", { ascending: false });
  else if (sort === "newest")     query = query.order("created_at", { ascending: false });
  else                            query = query.order("title", { ascending: true });

  const { data, count, error } = await query.range(0, 499);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type RawProduct = Record<string, unknown> & { users?: { email: string; company_name?: string; subscription_tier?: string | null } | Array<{ email: string; company_name?: string; subscription_tier?: string | null }> };
  const normalized = (data ?? []).map((p: RawProduct) => ({
    ...p,
    users: Array.isArray(p.users) ? p.users[0] ?? null : p.users,
  }));

  normalized.sort((a, b) => {
    const ta = TIER_PRIORITY[(a.users as { subscription_tier?: string } | null)?.subscription_tier ?? ""] ?? 4;
    const tb = TIER_PRIORITY[(b.users as { subscription_tier?: string } | null)?.subscription_tier ?? ""] ?? 4;
    return ta - tb;
  });

  const from = (page - 1) * PAGE_SIZE;
  const paginated = normalized.slice(from, from + PAGE_SIZE);
  const products = paginated.map((p) => ({
    ...p,
    users: p.users ? { email: (p.users as { email: string; company_name?: string }).email, company_name: (p.users as { email: string; company_name?: string }).company_name } : null,
  }));

  const res = NextResponse.json({ products, count: count ?? normalized.length, totalPages: Math.ceil((count ?? normalized.length) / PAGE_SIZE), page });
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
}
