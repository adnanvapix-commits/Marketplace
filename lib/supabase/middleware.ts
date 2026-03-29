import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // If Supabase URL is not configured, skip middleware entirely
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey ||
      supabaseUrl === "your_supabase_project_url" ||
      supabaseKey === "your_supabase_anon_key") {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
        );
      },
    },
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const path = request.nextUrl.pathname;

    // Routes that require login
    const authRequired = ["/sell", "/chat", "/profile", "/dashboard", "/buy", "/product"];
    const needsAuth = authRequired.some((p) => path.startsWith(p));

    if (needsAuth && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Routes that require verified + subscribed (skip admin)
    const restrictedPaths = ["/buy", "/product", "/chat", "/sell", "/dashboard"];
    const isRestricted = restrictedPaths.some((p) => path.startsWith(p));
    const isAdminPath = path.startsWith("/admin");

    if (isRestricted && user && !isAdminPath) {
      const { data: profile } = await supabase
        .from("users")
        .select("is_verified, is_subscribed, role, verification_status")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") return supabaseResponse;

      if (!profile?.is_verified) {
        const url = request.nextUrl.clone();
        if (path !== "/pending") {
          url.pathname = "/pending";
          return NextResponse.redirect(url);
        }
      }

      if (profile?.is_verified && !profile?.is_subscribed) {
        const url = request.nextUrl.clone();
        if (path !== "/subscribe") {
          url.pathname = "/subscribe";
          return NextResponse.redirect(url);
        }
      }
    }
  } catch {
    // If anything fails, just continue — don't crash
    return supabaseResponse;
  }

  return supabaseResponse;
}
