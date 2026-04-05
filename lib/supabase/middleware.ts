import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "your_supabase_project_url" ||
    supabaseKey === "your_supabase_anon_key"
  ) {
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

    // 1. Auth guard — redirect authenticated users away from login/register
    if (path === "/login" || path === "/register") {
      if (user) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // 2. Admin protection
    if (path.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      const { data: adminProfile } = await supabase
        .from("users").select("role").eq("id", user.id).single();
      if (adminProfile?.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // 3. Routes that require login
    const loginRequired = ["/sell", "/buy", "/chat", "/dashboard", "/profile"];
    const requiresLogin = loginRequired.some((p) => path.startsWith(p));

    if (requiresLogin && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // 4. Verification gating — logged-in but unverified users blocked from core routes
    const verificationRequired = ["/sell", "/buy", "/chat", "/dashboard"];
    const requiresVerification = verificationRequired.some((p) => path.startsWith(p));

    if (requiresVerification && user) {
      try {
        const { data: profile } = await supabase
          .from("users").select("is_verified").eq("id", user.id).single();

        if (!profile?.is_verified) {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          // Set a short-lived cookie so the home page can show a toast
          const redirectResponse = NextResponse.redirect(url);
          redirectResponse.cookies.set("unverified_redirect", "1", { path: "/", maxAge: 10 });
          return redirectResponse;
        }
      } catch {
        // If profile fetch fails, allow through (don't block on DB errors)
      }
    }

  } catch {
    return supabaseResponse;
  }

  return supabaseResponse;
}
