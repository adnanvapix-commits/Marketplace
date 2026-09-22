import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ suggestions: [] });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] });

  // Verify subscription via DB — user_metadata is user-writable and cannot be trusted
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  const isAdmin = user.email === adminEmail;
  if (!isAdmin) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_verified, is_subscribed, role")
      .eq("id", user.id)
      .single();
    const hasAccess =
      profile?.role === "admin" ||
      (profile?.is_verified === true && profile?.is_subscribed === true);
    if (!hasAccess) return NextResponse.json({ suggestions: [] });
  }

  // Limit query length to prevent abuse
  const safeQ = q.slice(0, 60);

  const { data } = await supabase
    .from("products")
    .select("title, brand, category")
    .eq("is_active", true)
    .eq("is_blocked", false)
    .or(`title.ilike.%${safeQ}%,brand.ilike.%${safeQ}%`)
    .limit(6);

  const seen = new Set<string>();
  const suggestions: string[] = [];
  (data ?? []).forEach(p => {
    if (p.title && !seen.has(p.title)) { seen.add(p.title); suggestions.push(p.title); }
    if (p.brand && !seen.has(p.brand) && p.brand.toLowerCase().includes(safeQ.toLowerCase())) {
      seen.add(p.brand); suggestions.push(p.brand);
    }
  });

  return NextResponse.json({ suggestions: suggestions.slice(0, 6) });
}
