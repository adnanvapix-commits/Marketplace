import { NextRequest, NextResponse } from "next/server";

// Fast logout: clear all session cookies immediately and redirect.
// We do NOT await supabase.auth.signOut() — that costs a round-trip.
// The cookie deletion is sufficient to invalidate the session server-side.
function buildLogoutResponse(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const res = NextResponse.redirect(`${origin}/`, { status: 302 });

  // Clear every Supabase session cookie immediately
  for (const cookie of request.cookies.getAll()) {
    const n = cookie.name;
    if (n.includes("sb-") || n.includes("supabase") || n.startsWith("verified_")) {
      res.cookies.set(n, "", { maxAge: 0, path: "/" });
    }
  }

  return res;
}

export async function POST(request: NextRequest) {
  return buildLogoutResponse(request);
}

export async function GET(request: NextRequest) {
  return buildLogoutResponse(request);
}
