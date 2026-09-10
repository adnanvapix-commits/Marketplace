import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 16;

// Tier sort priority: elite=1, expert=2, beginner=3, none=4
// We fetch a larger slice, sort in-process by tier then user-chosen sort,
// then apply pagination — this keeps DB calls minimal while tier ordering
// is invisible to the front-end (no tier info exposed in the response).
const TIER_PRIORITY: Record<string, number> = {
  elite: 1,
  expert: 2,
  beginner: 3,
};

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // ── Auth + access check (single parallel call) ─────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("is_verified, is_subscribed, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const hasAccess = isAdmin || (profile?.is_verified && profile?.is_subscribed);
  if (!hasAccess) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  // ── Parse query params ──────────────────────────────────────────────────
  const sp = req.nextUrl.searchParams;
  const q         = sp.get("q")?.trim() || "";
  const category  = sp.get("category") || "";
  const condition = sp.get("condition") || "";
  const brand     = sp.get("brand")?.trim() || "";
  const location  = sp.get("location")?.trim() || "";
  const minPrice  = sp.get("minPrice") ? parseFloat(sp.get("minPrice")!) : null;
  const maxPrice  = sp.get("maxPrice") ? parseFloat(sp.get("maxPrice")!) : null;
  const minQty    = sp.get("minQty")   ? parseInt(sp.get("minQty")!)     : null;
  const minMoq    = sp.get("minMoq")   ? parseInt(sp.get("minMoq")!)     : null;
  const sort      = sp.get("sort") || "alpha";
  const page      = Math.max(1, parseInt(sp.get("page") || "1"));

  // ── Build query — join seller tier (internal, never returned to client) ─
  let query = supabase
    .from("products")
    .select("*, users(email, company_name, subscription_tier)", { count: "exact" })
    .eq("is_active", true)
    .eq("is_blocked", false);

  if (q)        query = query.or(`title.ilike.%${q}%,brand.ilike.%${q}%`);
  if (category)  query = query.eq("category", category);
  if (condition) query = query.eq("condition", condition);
  if (brand)     query = query.ilike("brand", `%${brand}%`);
  if (location)  query = query.ilike("location", `%${location}%`);
  if (minPrice !== null) query = query.gte("price", minPrice);
  if (maxPrice !== null) query = query.lte("price", maxPrice);
  if (minQty !== null)   query = query.gte("quantity", minQty);
  if (minMoq !== null)   query = query.lte("minimum_order_quantity", minMoq);

  // Primary DB sort (secondary sort applied in-process after tier ranking)
  if (sort === "price_asc")       query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "qty_desc")   query = query.order("quantity", { ascending: false });
  else if (sort === "newest")     query = query.order("created_at", { ascending: false });
  else                            query = query.order("title", { ascending: true });

  // Fetch full result set for the current filters (cap at 500 rows to stay fast)
  // so we can apply tier sorting correctly before paginating.
  const { data, count, error } = await query.range(0, 499);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Normalize users join ────────────────────────────────────────────────
  type RawProduct = Record<string, unknown> & {
    users?: { email: string; company_name?: string; subscription_tier?: string | null } | Array<{ email: string; company_name?: string; subscription_tier?: string | null }>;
  };

  const normalized = (data ?? []).map((p: RawProduct) => ({
    ...p,
    users: Array.isArray(p.users) ? p.users[0] ?? null : p.users,
  }));

  // ── Tier-based sort (Elite → Expert → Beginner → none) ─────────────────
  // Applied silently — tier info is stripped before sending to client.
  const tierOf = (p: typeof normalized[0]) => {
    const tier = (p.users as { subscription_tier?: string | null } | null)?.subscription_tier;
    return TIER_PRIORITY[tier ?? ""] ?? 4;
  };

  normalized.sort((a, b) => {
    const tDiff = tierOf(a) - tierOf(b);
    if (tDiff !== 0) return tDiff;
    // Within same tier, preserve the DB sort order (index-stable in JS)
    return 0;
  });

  // ── Paginate in-process ─────────────────────────────────────────────────
  const totalCount = count ?? normalized.length;
  const from = (page - 1) * PAGE_SIZE;
  const paginated = normalized.slice(from, from + PAGE_SIZE);

  // ── Strip tier from response (hidden from UI) ───────────────────────────
  const products = paginated.map((p) => ({
    ...p,
    users: p.users
      ? { email: (p.users as { email: string; company_name?: string }).email, company_name: (p.users as { email: string; company_name?: string }).company_name }
      : null,
  }));

  const res = NextResponse.json({
    products,
    count: totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    page,
  });

  // Cache for 30 seconds on CDN edge — reduces cold load time significantly
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
}
