import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Redirect to homepage after logout
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(`${origin}/`, { status: 302 });
}
