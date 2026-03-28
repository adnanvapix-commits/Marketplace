import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
  // Auth user (for adminId in logs)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Admin client — bypasses RLS, sees all users
  const db = createAdminClient();
  const { data: users, error } = await db
    .from("users")
    .select("id, email, role, is_subscribed, subscription_expiry, is_blocked, created_at")
    .order("created_at", { ascending: false });

  if (error) console.error("[admin/users] fetch error:", error.message);

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">{users?.length ?? 0} total users</p>
      </div>

      {error ? (
        <div className="card p-6 text-red-500 text-sm">
          Failed to load users: {error.message}
        </div>
      ) : (
        <UsersTable initialUsers={users ?? []} adminId={user?.id ?? ""} />
      )}
    </div>
  );
}
