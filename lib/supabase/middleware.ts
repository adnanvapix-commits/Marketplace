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

    // Use getSession() — reads from cookie, ZERO network call for routing decisions.
    // DB verification happens in API routes using getUser() (cryptographically verified).
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    // 1. Redirect logged-in users away from login/register
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
      if (user.email !== adminEmail) {
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

    // 4. Subscription gate — only for buy/sell/chat (marketplace actions)
    //    Verification is independent — profile/account/subscription are always accessible
    //    so users can see their status and subscribe after being verified.
    //
    //    IMPORTANT: JWT metadata (user_metadata) can be STALE — it's only refreshed
    //    when the user's session token is renewed. When an admin approves a user,
    //    the DB is updated but the user's existing JWT is unchanged until they
    //    get a new token. So we ALWAYS do a fresh DB check here instead of
    //    trusting user_metadata, to avoid blocking newly approved users.
    const subscriptionRequired = ["/sell", "/buy", "/chat"];
    const requiresSubscription = subscriptionRequired.some((p) => path.startsWith(p));

    if (requiresSubscription && user) {
      const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
      const isAdmin = user.email === adminEmail || user.user_metadata?.role === "admin";

      if (!isAdmin) {
        // Always do a fresh DB check — never trust stale JWT metadata for access gates.
        // This single query costs ~5ms on Supabase and is worth it to avoid
        // blocking newly verified+subscribed users whose JWT hasn't refreshed yet.
        const { data: profile } = await supabase
          .from("users")
          .select("is_verified, is_subscribed, is_blocked, subscription_expiry, role")
          .eq("id", user.id)
          .single();

        // Block suspended users entirely
        if (profile?.is_blocked) {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }

        // Admin role in DB overrides everything
        if (profile?.role === "admin") {
          return supabaseResponse;
        }

        const isVerified = profile?.is_verified === true;
        const subExpiry = profile?.subscription_expiry ? new Date(profile.subscription_expiry) : null;
        const isSubscribed = profile?.is_subscribed === true && (!subExpiry || subExpiry > new Date());

        // Need BOTH verified AND active subscription to access marketplace
        if (!isVerified || !isSubscribed) {
          const url = request.nextUrl.clone();
          // Send to a dedicated page that explains why access was denied
          // and what the user needs to do — much better UX than silent redirect to homepage
          url.pathname = "/access-required";
          url.searchParams.set("reason", !isVerified ? "not_verified" : "no_subscription");
          url.searchParams.set("from", path);
          return NextResponse.redirect(url);
        }

        // Access granted — stamp a short-lived internal header so the search API
        // can skip its duplicate DB check, saving one full DB round trip per search.
        supabaseResponse.headers.set("x-bulkora-access-verified", user.id);
      }    }

  } catch {
    // Fail-closed on errors for protected routes
    const path = request.nextUrl.pathname;
    const isProtected = ["/admin", "/sell", "/buy", "/chat", "/dashboard", "/profile"].some(p => path.startsWith(p));
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
