import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Get current auth user (uses anon key + session cookie)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Use admin client to read role (bypasses RLS)
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("users")
    .select("role, email")
    .eq("id", user.id)
    .single();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  const isAdmin = profile?.role === "admin" || profile?.email === adminEmail;

  if (!isAdmin) redirect("/");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
