import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountForm from "./AccountForm";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your profile and preferences</p>
      </div>
      <AccountForm profile={profile} email={user.email ?? ""} userId={user.id} />
    </div>
  );
}
