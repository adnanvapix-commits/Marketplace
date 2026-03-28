import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client.
 * Uses the service role key — bypasses ALL RLS policies.
 * NEVER expose this on the client side.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey || serviceKey === "your_service_role_key_here") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Get it from Supabase Dashboard → Project Settings → API → service_role"
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
