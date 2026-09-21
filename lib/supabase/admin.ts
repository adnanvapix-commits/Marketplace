import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client.
 * Routes through pgBouncer transaction pooler when SUPABASE_POOLER_URL is set.
 * This is CRITICAL on Nano compute (only 15 direct connections).
 *
 * Setup:
 * 1. Supabase Dashboard → Project Settings → Database → Connection Pooling
 * 2. Copy the "Transaction mode" URL (port 6543)
 * 3. Add to Vercel env: SUPABASE_POOLER_URL=postgresql://postgres.REF:PASS@pooler.supabase.com:6543/postgres
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceKey || serviceKey === "your_service_role_key_here") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  // Use pooler URL if set — prevents connection exhaustion on Nano (15 conn limit)
  // Falls back to direct URL — works but may buffer under load
  const url = process.env.SUPABASE_POOLER_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "public" },
  });
}
