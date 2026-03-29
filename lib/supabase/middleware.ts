import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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

    // Skip admin routes — handled by admin layout
    if (path.startsWith("/admin")) return supabaseResponse;

    // Routes that require login only (no verification check)
    const loginRequired = ["/sell", "/chat", "/profile", "/dashboard"];
    const needsLogin = loginRequired.some((p) => path.startsWith(p));

    if (needsLogin && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // /sell and /dashboard also require verified + subscribed
    const strictPaths = ["/sell", "/dashboard"];
    const isStrict = strictPaths.some((p) => path.startsWith(p));

    if (isStrict && user) {
      const { data: profile } = await supabase
        .from("users")
        .select("is_verified, is_subscribed, role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") return supabaseResponse;

      if (!profile?.is_verified) {
        const url = request.nextUrl.clone();
        url.pathname = "/pending";
        return NextResponse.redirect(url);
      }

      if (!profile?.is_subscribed) {
        const url = request.nextUrl.clone();
        url.pathname = "/subscribe";
        return NextResponse.redirect(url);
      }
    }

    // /buy and /product — require login, but NOT verification
    // (the search API handles access control for actual data)
    const buyPaths = ["/buy", "/product"];
    const isBuyPath = buyPaths.some((p) => path.startsWith(p));

    if (isBuyPath && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

  } catch {
    return supabaseResponse;
  }

  return supabaseResponse;
}
