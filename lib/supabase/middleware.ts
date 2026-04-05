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
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(
            name,
            value,
            options as Parameters<typeof supabaseResponse.cookies.set>[2]
          )
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const path = request.nextUrl.pathname;

    // 1. Auth guard — redirect authenticated users away from auth routes (Req 4.1, 4.2)
    if (path === "/login" || path === "/register") {
      if (user) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // 2. Admin protection — only admin role may access /admin/* (Req 13.12)
    if (path.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }

      const { data: adminProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (adminProfile?.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }

      return supabaseResponse;
    }

    // 3. Unauthenticated protection — login required routes (Req 5.7, 10.3)
    const loginRequiredPrefixes = [
      "/buy",
      "/sell",
      "/chat",
      "/dashboard",
      "/profile",
    ];
    const requiresLogin = loginRequiredPrefixes.some((p) =>
      path.startsWith(p)
    );

    if (requiresLogin && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // 4. Verification gating — authenticated but unverified users (Req 5.1–5.4)
    const verificationGatedPrefixes = ["/buy", "/sell", "/chat", "/dashboard"];
    const requiresVerification = verificationGatedPrefixes.some((p) =>
      path.startsWith(p)
    );

    if (requiresVerification && user) {
      let isVerified = false;

      try {
        const { data: profile, error } = await supabase
          .from("users")
          .select("is_verified")
          .eq("id", user.id)
          .single();

        if (error) {
          // Error handling: treat as unverified and redirect to /home (Req error handling)
          const url = request.nextUrl.clone();
          url.pathname = "/home";
          const redirectResponse = NextResponse.redirect(url);
          return redirectResponse;
        }

        isVerified = profile?.is_verified ?? false;
      } catch {
        // Query failed — treat as unverified, redirect to /home
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }

      if (!isVerified) {
        // Set cookie so client can show toast (Req 5.5)
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.cookies.set("verification_redirect", "1", {
          path: "/",
          maxAge: 30,
        });
        return redirectResponse;
      }

      // 5. Verified users — allow through (Req 5.6)
      return supabaseResponse;
    }
  } catch {
    return supabaseResponse;
  }

  return supabaseResponse;
}
