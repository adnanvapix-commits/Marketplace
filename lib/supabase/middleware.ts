import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Routes that require just being logged in (admin handles its own auth)
  const authRequired = ["/sell", "/chat", "/profile", "/dashboard", "/buy", "/product"];
  const needsAuth = authRequired.some((p) => path.startsWith(p));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Routes that require verified + subscribed
  const restrictedPaths = ["/buy", "/product", "/chat", "/sell", "/dashboard"];
  const isRestricted = restrictedPaths.some((p) => path.startsWith(p));
  // Admin routes handle their own auth — skip middleware checks
  const isAdminPath = path.startsWith("/admin");

  if (isRestricted && user && !isAdminPath) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_verified, is_subscribed, role, verification_status")
      .eq("id", user.id)
      .single();

    // Admins bypass all checks
    if (profile?.role === "admin") return supabaseResponse;

    // Not verified yet — redirect to pending page
    if (!profile?.is_verified) {
      const url = request.nextUrl.clone();
      url.pathname = "/pending";
      if (path !== "/pending") return NextResponse.redirect(url);
    }

    // Verified but not subscribed — redirect to subscribe page
    if (profile?.is_verified && !profile?.is_subscribed) {
      const url = request.nextUrl.clone();
      url.pathname = "/subscribe";
      if (path !== "/subscribe") return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
