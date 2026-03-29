import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Get current auth session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Use service role client to bypass RLS and read role
  let isAdmin = false;
  try {
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("users")
      .select("role, email")
      .eq("id", user.id)
      .single();

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
    isAdmin = profile?.role === "admin" || profile?.email === adminEmail;
  } catch {
    // If service role key not set, fall back to email check only
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
    isAdmin = user.email === adminEmail;
  }

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
