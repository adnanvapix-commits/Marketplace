/**
 * Shared access check helper — used by API routes that require
 * both is_verified AND is_subscribed (not expired).
 *
 * Always does a fresh DB query. Never trusts user_metadata (user-writable).
 *
 * Returns: { allowed: true } | { allowed: false, status: 401 | 403 }
 */
import { createClient } from "@/lib/supabase/server";

export async function requireMarketplaceAccess(): Promise<
  | { allowed: true; userId: string }
  | { allowed: false; status: 401 | 403; error: string }
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { allowed: false, status: 401, error: "Unauthorized" };

  // Admin bypass — fast path via email match (no DB call)
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  if (user.email === adminEmail) return { allowed: true, userId: user.id };

  // Fresh DB check — never trust stale JWT metadata
  const { data: profile } = await supabase
    .from("users")
    .select("is_verified, is_subscribed, is_blocked, subscription_expiry, role")
    .eq("id", user.id)
    .single();

  if (!profile) return { allowed: false, status: 403, error: "Access denied" };
  if (profile.is_blocked) return { allowed: false, status: 403, error: "Account suspended" };
  if (profile.role === "admin") return { allowed: true, userId: user.id };

  const subExpiry = profile.subscription_expiry ? new Date(profile.subscription_expiry) : null;
  const isSubscribed = profile.is_subscribed === true && (!subExpiry || subExpiry > new Date());

  if (!profile.is_verified) return { allowed: false, status: 403, error: "Account not verified" };
  if (!isSubscribed) return { allowed: false, status: 403, error: "Active subscription required" };

  return { allowed: true, userId: user.id };
}
