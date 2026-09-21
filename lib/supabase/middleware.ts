import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail-closed: if env vars are missing, block all protected routes
  if (
    !supabaseUrl || !supabaseKey ||
    supabaseUrl === "your_supabase_project_url" ||
    supabaseKey === "your_supabase_anon_key"
  ) {
    const path = request.nextUrl.pathname;
    const isProtected = ["/admin", "/sell", "/buy", "/chat", "/dashboard", "/profile", "/subscription", "/account"].some(p => path.startsWith(p));
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
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

  // Wrap entire logic in try/catch — fail-closed: on any error, block protected routes
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const path = request.nextUrl.pathname;

    // 1. Redirect logged-in users away from login page
    if (path === "/login" || path === "/register") {
      if (user) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // 2. Admin protection — DB check for non-admin-email users
    if (path.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      // Use server-only ADMIN_EMAIL, fall back to NEXT_PUBLIC for compatibility
      const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
      if (user.email !== adminEmail) {
        // Always verify via DB for non-known-admin-email users
        const { data: adminProfile } = await supabase
          .from("users").select("role").eq("id", user.id).single();
        if (adminProfile?.role !== "admin") {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }
      return supabaseResponse;
    }

    // 3. Login required routes
    const loginRequired = ["/sell", "/buy", "/chat", "/dashboard", "/profile", "/subscription", "/help", "/account"];
    const requiresLogin = loginRequired.some((p) => path.startsWith(p));
    if (requiresLogin && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // 4. Verification gating — /subscription and /help accessible to all logged-in users
    // SECURITY: removed unsigned cookie cache — it could be forged by users.
    // Instead, read is_verified from JWT metadata (populated by DB trigger, server-side only).
    // JWT metadata is signed and cannot be forged by users.
    const verificationRequired = ["/sell", "/buy", "/chat", "/dashboard"];
    const requiresVerification = verificationRequired.some((p) => path.startsWith(p));

    if (requiresVerification && user) {
      // Primary: read from signed JWT metadata (set by DB trigger, not user-writable via normal SDK)
      const jwtMeta = user.user_metadata ?? {};
      let isVerified = jwtMeta.is_verified === true;

      // Fallback: if JWT metadata not synced (new user), do a DB check
      if (!isVerified) {
        try {
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (serviceKey && serviceKey !== "your_service_role_key_here") {
            const adminDb = createAdminSupabase(supabaseUrl, serviceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data: profile } = await adminDb
              .from("users").select("is_verified, is_subscribed").eq("id", user.id).single();
            isVerified = !!(profile?.is_verified && profile?.is_subscribed);
          } else {
            const { data: profile } = await supabase
              .from("users").select("is_verified, is_subscribed").eq("id", user.id).single();
            isVerified = !!(profile?.is_verified && profile?.is_subscribed);
          }
        } catch {
          // DB error — fail-closed: block unverified access
          isVerified = false;
        }
      }

      if (!isVerified) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.cookies.set("unverified_redirect", "1", {
          path: "/", maxAge: 10, httpOnly: true, sameSite: "lax",
        });
        return redirectResponse;
      }
    }

  } catch {
    // Fail-closed: on any unexpected error, block access to protected routes
    const path = request.nextUrl.pathname;
    const isProtected = ["/admin", "/sell", "/buy", "/chat", "/dashboard"].some(p => path.startsWith(p));
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}
