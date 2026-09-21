import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client.
 * Uses the service role key — bypasses ALL RLS policies.
 * Uses pgBouncer/pooler URL if available to prevent connection exhaustion.
 * NEVER expose this on the client side.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey || serviceKey === "your_service_role_key_here") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Get it from Supabase Dashboard → Project Settings → API → service_role"
    );
  }

  // Prefer the session pooler URL (port 6543) to avoid exhausting direct connections
  // Set SUPABASE_DB_URL in your env to use pgBouncer transaction mode
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        // Tell PostgREST to use a short statement timeout to release connections faster
        "x-connection-encrypted": "true",
      },
    },
  });
}
