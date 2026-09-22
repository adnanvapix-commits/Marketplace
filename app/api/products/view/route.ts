import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPooledAdminClient as createAdminClient } from "@/lib/supabase/admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Simple in-memory dedup: 1 view per user per product per 10 minutes
const viewedRecently = new Map<string, number>();
const VIEW_DEDUP_MS = 10 * 60 * 1000; // 10 minutes

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, ts] of viewedRecently) {
    if (now - ts > VIEW_DEDUP_MS) viewedRecently.delete(key);
  }
}

// POST — increment view count (requires auth + subscription to prevent abuse)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Silently ignore unauthenticated requests — don't leak 401 errors
  if (!user) return NextResponse.json({ ok: false });

  const { productId } = await req.json();
  if (!productId || !UUID_REGEX.test(productId))
    return NextResponse.json({ ok: false });

  // Dedup: same user + same product within 10 min = no count increment
  const dedupeKey = `${user.id}:${productId}`;
  const now = Date.now();
  if (viewedRecently.has(dedupeKey)) return NextResponse.json({ ok: true });

  // Periodic cleanup to prevent memory leak
  if (viewedRecently.size > 5000) cleanupOldEntries();
  viewedRecently.set(dedupeKey, now);

  try {
    const db = createAdminClient();
    await db.rpc("increment_view_count", { product_id: productId });
  } catch { /* non-blocking */ }

  return NextResponse.json({ ok: true });
}
