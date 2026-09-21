import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST — increment view count (fire-and-forget, no auth required)
export async function POST(req: NextRequest) {
  const { productId } = await req.json();
  if (!productId || !UUID_REGEX.test(productId))
    return NextResponse.json({ ok: false });

  try {
    const db = createAdminClient();
    await db.rpc("increment_view_count", { product_id: productId });
  } catch { /* non-blocking, fails silently */ }

  return NextResponse.json({ ok: true });
}
