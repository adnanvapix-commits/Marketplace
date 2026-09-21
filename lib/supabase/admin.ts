import { createClient } from "@supabase/supabase-js";

const serviceKey = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key || key === "your_service_role_key_here") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }
  return key;
};

/**
 * Admin client — uses direct connection URL.
 * Use this for complex queries with foreign key joins (e.g. chat inbox).
 * Transaction pooler doesn't support PostgREST joins over foreign keys.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Pooled admin client — uses pgBouncer transaction mode when SUPABASE_POOLER_URL is set.
 * Use this for simple SELECT/INSERT/UPDATE/DELETE queries without foreign key joins.
 * Falls back to direct URL if pooler not configured.
 */
export function createPooledAdminClient() {
  const url = process.env.SUPABASE_POOLER_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return createClient(url, serviceKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
