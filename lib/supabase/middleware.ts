import { createServerClient } from "@supabase/ssr";
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

  try {
    const path = request.nextUrl.pathname;

    // ── Fast path: use getSession() — reads from cookie, ZERO network call
    // This is safe for middleware routing decisions. Actual DB verification
    // happens in API routes which use getUser() (cryptographically verified).
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    // 1. Redirect logged-in users away from login
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
      const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
      // Fast check: email match from session (no DB call)
      if (user.email !== adminEmail) {
        // Check role from JWT metadata (set by DB trigger — trusted)
        const role = user.user_metadata?.role ?? user.app_metadata?.role;
        if (role !== "admin") {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }
      return supabaseResponse;
    }

    // 3. Login required
    const loginRequired = ["/sell", "/buy", "/chat", "/dashboard", "/profile", "/subscription", "/help", "/account"];
    const requiresLogin = loginRequired.some((p) => path.startsWith(p));
    if (requiresLogin && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // 4. Verification gate — read from JWT metadata (set by DB trigger)
    // Zero DB call — JWT is signed by Supabase, metadata is server-set via trigger
    const verificationRequired = ["/sell", "/buy", "/chat", "/dashboard"];
    const requiresVerification = verificationRequired.some((p) => path.startsWith(p));

    if (requiresVerification && user) {
      const meta = user.user_metadata ?? {};
      // Trust JWT: is_verified is written by the DB trigger (sync_user_metadata)
      // which only Supabase admin functions can update — not user-writable
      const isVerified   = meta.is_verified   === true;
      const isSubscribed = meta.is_subscribed === true;
      const isAdmin      = user.email === (process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "")
                        || meta.role === "admin";

      if (!isAdmin && !(isVerified && isSubscribed)) {
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
    // Fail-closed on errors for protected routes
    const path = request.nextUrl.pathname;
    const isProtected = ["/admin", "/sell", "/buy", "/chat", "/dashboard"].some(p => path.startsWith(p));
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
