import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Run auth + profile check in parallel
  const [{ data: { user } }, adminClient] = await Promise.all([
    supabase.auth.getUser(),
    Promise.resolve(createAdminClient()),
  ]);

  if (!user) redirect("/login");

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

  let isAdmin = user.email === adminEmail; // fast path — no DB hit for known admin email

  if (!isAdmin) {
    try {
      const { data: profile } = await adminClient
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
    } catch {
      isAdmin = false;
    }
  }

  if (!isAdmin) redirect("/");

  return (
    <div className="flex min-h-screen bg-cream-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
