import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore — we're redirecting regardless
  }

  const origin = request.nextUrl.origin;
  const res = NextResponse.redirect(`${origin}/`, { status: 302 });

  // Aggressively clear all Supabase session cookies
  const cookieNames = request.cookies.getAll().map((c) => c.name);
  for (const name of cookieNames) {
    if (name.includes("sb-") || name.includes("supabase") || name.startsWith("verified_")) {
      res.cookies.set(name, "", { maxAge: 0, path: "/" });
    }
  }

  return res;
}

// Also handle GET for direct link navigation
export async function GET(request: NextRequest) {
  return POST(request);
}
