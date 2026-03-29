import { createClient } from "@/lib/supabase/client";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_verified: boolean;
  verification_status: "pending" | "approved" | "rejected";
  is_subscribed: boolean;
  subscription_expiry: string | null;
  is_blocked: boolean;
  created_at: string;
}

export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  category: string;
  is_blocked: boolean;
  created_at: string;
  user_id: string;
  users?: { email: string } | null;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalMessages: number;
  totalSubscribed: number;
}

export interface AdminLog {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  admin_id: string | null;
  target_user_id: string | null;
  target_product_id: string | null;
}

// ── Stats ──────────────────────────────────────────────────
export async function fetchAdminStats(): Promise<AdminStats> {
  const supabase = createClient();
  const [users, products, messages, subscribed] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("is_subscribed", true),
  ]);
  return {
    totalUsers: users.count ?? 0,
    totalProducts: products.count ?? 0,
    totalMessages: messages.count ?? 0,
    totalSubscribed: subscribed.count ?? 0,
  };
}

// ── Users ──────────────────────────────────────────────────
export async function fetchAdminUsers(search = ""): Promise<AdminUser[]> {
  const supabase = createClient();
  let q = supabase
    .from("users")
    .select("id, email, role, is_subscribed, subscription_expiry, is_blocked, created_at")
    .order("created_at", { ascending: false });
  if (search.trim()) q = q.ilike("email", `%${search.trim()}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as AdminUser[]) ?? [];
}

export async function updateUserSubscription(
  userId: string,
  isSubscribed: boolean,
  expiryDate: string | null,
  adminId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("users")
    .update({ is_subscribed: isSubscribed, subscription_expiry: expiryDate })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  // Log the action
  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: isSubscribed ? "activate_subscription" : "deactivate_subscription",
    target_user_id: userId,
    details: { expiry: expiryDate },
  });
}

export async function blockUser(userId: string, blocked: boolean, adminId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("users").update({ is_blocked: blocked }).eq("id", userId);
  if (error) throw new Error(error.message);
  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: blocked ? "block_user" : "unblock_user",
    target_user_id: userId,
  });
}

// ── Products ───────────────────────────────────────────────
export async function fetchAdminProducts(search = ""): Promise<AdminProduct[]> {
  const supabase = createClient();
  let q = supabase
    .from("products")
    .select("id, title, price, category, is_blocked, created_at, user_id, users(email)")
    .order("created_at", { ascending: false });
  if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  // Normalize users join (Supabase returns array, we need object)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((p: any) => ({
    ...p,
    users: Array.isArray(p.users) ? (p.users[0] ?? null) : p.users,
  })) as AdminProduct[];
}

export async function deleteAdminProduct(productId: string, adminId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: "delete_product",
    target_product_id: productId,
  });
}

export async function blockProduct(productId: string, blocked: boolean, adminId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("products").update({ is_blocked: blocked }).eq("id", productId);
  if (error) throw new Error(error.message);
  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: blocked ? "block_product" : "unblock_product",
    target_product_id: productId,
  });
}

// ── Logs ───────────────────────────────────────────────────
export async function fetchAdminLogs(): Promise<AdminLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data as AdminLog[]) ?? [];
}

// ── Auth check (server-side) ───────────────────────────────
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
