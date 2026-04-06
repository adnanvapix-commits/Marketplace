import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
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

    // 1. Auth guard
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

    // 3. Login required
    const loginRequired = ["/sell", "/buy", "/chat", "/dashboard", "/profile"];
    const requiresLogin = loginRequired.some((p) => path.startsWith(p));
    if (requiresLogin && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // 4. Verification gating — use cached cookie to avoid DB hit on every request
    const verificationRequired = ["/sell", "/buy", "/chat", "/dashboard"];
    const requiresVerification = verificationRequired.some((p) => path.startsWith(p));

    if (requiresVerification && user) {
      // Check cached verification status (5 min TTL)
      const cachedVerified = request.cookies.get(`verified_${user.id}`)?.value;

      if (cachedVerified === "1") {
        // Already verified — allow through without DB query
        return supabaseResponse;
      }

      if (cachedVerified === "0") {
        // Cached as unverified — redirect without DB query
        const url = request.nextUrl.clone();
        url.pathname = "/";
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.cookies.set("unverified_redirect", "1", { path: "/", maxAge: 10 });
        return redirectResponse;
      }

      // No cache — fetch from DB using service role for speed (bypasses RLS)
      try {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        let isVerified = false;

        if (serviceKey && serviceKey !== "your_service_role_key_here") {
          const adminDb = createAdminSupabase(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
          const { data: profile } = await adminDb
            .from("users").select("is_verified").eq("id", user.id).single();
          isVerified = profile?.is_verified ?? false;
        } else {
          // Fallback to anon client
          const { data: profile } = await supabase
            .from("users").select("is_verified").eq("id", user.id).single();
          isVerified = profile?.is_verified ?? false;
        }

        if (!isVerified) {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          const redirectResponse = NextResponse.redirect(url);
          redirectResponse.cookies.set("unverified_redirect", "1", { path: "/", maxAge: 10 });
          // Cache unverified for 60s
          redirectResponse.cookies.set(`verified_${user.id}`, "0", { path: "/", maxAge: 60 });
          return redirectResponse;
        }

        // Cache verified for 5 minutes
        supabaseResponse.cookies.set(`verified_${user.id}`, "1", { path: "/", maxAge: 300 });
      } catch {
        // DB error — allow through, don't block
      }
    }

  } catch {
    return supabaseResponse;
  }

  return supabaseResponse;
}
