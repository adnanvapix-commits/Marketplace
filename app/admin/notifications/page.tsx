import { createPooledAdminClient as createAdminClient } from "@/lib/supabase/admin";
import NotificationSender from "./NotificationSender";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const db = createAdminClient();

  // Fetch all users for the dropdown
  const { data: users } = await db
    .from("users")
    .select("id, email, full_name, company_name")
    .order("created_at", { ascending: false });

  // Recent notifications sent
  const { data: recent } = await db
    .from("notifications")
    .select("id, user_id, type, title, message, created_at, read")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Send Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Send in-app notifications to specific users or everyone</p>
      </div>
      <NotificationSender users={users ?? []} recentNotifications={recent ?? []} />
    </div>
  );
}
