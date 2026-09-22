import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // getUser() — cryptographic JWT verification, not local cookie parse.
  // user_metadata is user-writable so we cannot trust is_subscribed from it.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ suggestions: [] });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] });

  // Admin bypass via email only — never trust user_metadata.role
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  let hasAccess = user.email === adminEmail;

  if (!hasAccess) {
    // DB check: verify subscription is active AND not expired
    const { data: profile } = await supabase
      .from("users")
      .select("is_verified, is_subscribed, is_blocked, subscription_expiry, role")
      .eq("id", user.id)
      .single();

    if (profile?.is_blocked) return NextResponse.json({ suggestions: [] });
    if (profile?.role === "admin") {
      hasAccess = true;
    } else {
      const subExpiry = profile?.subscription_expiry
        ? new Date(profile.subscription_expiry)
        : null;
      const isSubscribed =
        profile?.is_subscribed === true && (!subExpiry || subExpiry > new Date());
      hasAccess = profile?.is_verified === true && isSubscribed;
    }
  }

  if (!hasAccess) return NextResponse.json({ suggestions: [] });

  const safeQ = q.slice(0, 60);

  const { data } = await supabase
    .from("products")
    .select("title, brand")
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
