import { createClient } from "@/lib/supabase/server";

/**
 * Server-side admin check.
 * Returns true if the current user has role = 'admin'
 * or matches the NEXT_PUBLIC_ADMIN_EMAIL env var.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check env var first (fast path)
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
    if (adminEmail && user.email === adminEmail) return true;

    // Check DB role
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    return data?.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Client-side admin check using Supabase client.
 */
export async function isAdminClient(supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
    if (adminEmail && user.email === adminEmail) return true;

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    return data?.role === "admin";
  } catch {
    return false;
  }
}
