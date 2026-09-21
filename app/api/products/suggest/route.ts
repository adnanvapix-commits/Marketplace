import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ suggestions: [] });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] });

  // Get up to 6 unique titles matching the query
  const { data } = await supabase
    .from("products")
    .select("title, brand, category")
    .eq("is_active", true)
    .eq("is_blocked", false)
    .or(`title.ilike.%${q}%,brand.ilike.%${q}%`)
    .limit(6);

  const seen = new Set<string>();
  const suggestions: string[] = [];
  (data ?? []).forEach(p => {
    if (p.title && !seen.has(p.title)) { seen.add(p.title); suggestions.push(p.title); }
    if (p.brand && !seen.has(p.brand) && p.brand.toLowerCase().includes(q.toLowerCase())) {
      seen.add(p.brand); suggestions.push(p.brand);
    }
  });

  return NextResponse.json({ suggestions: suggestions.slice(0, 6) });
}
