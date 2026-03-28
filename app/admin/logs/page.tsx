import { createAdminClient } from "@/lib/supabase/admin";
import { ScrollText } from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  activate_subscription:   { label: "Activated Subscription",  color: "bg-green-100 text-green-700" },
  deactivate_subscription: { label: "Deactivated Subscription", color: "bg-red-100 text-red-700" },
  block_user:              { label: "Blocked User",             color: "bg-orange-100 text-orange-700" },
  unblock_user:            { label: "Unblocked User",           color: "bg-blue-100 text-blue-700" },
  delete_product:          { label: "Deleted Product",          color: "bg-red-100 text-red-700" },
  block_product:           { label: "Blocked Product",          color: "bg-orange-100 text-orange-700" },
  unblock_product:         { label: "Unblocked Product",        color: "bg-blue-100 text-blue-700" },
};

export default async function AdminLogsPage() {
  const db = createAdminClient();
  const { data: logs, error } = await db
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) console.error("[admin/logs] fetch error:", error.message);

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ScrollText size={20} className="text-primary" /> Activity Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">{logs?.length ?? 0} recent actions</p>
      </div>

      {error ? (
        <div className="card p-6 text-red-500 text-sm">
          Failed to load logs: {error.message}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Target User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Details</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!logs || logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400 text-sm">
                    No logs yet
                  </td>
                </tr>
              ) : (
                logs.map((log: { id: string; action: string; target_user_id: string | null; target_product_id: string | null; details: Record<string, unknown> | null; created_at: string }) => {
                  const meta = ACTION_LABELS[log.action] ?? { label: log.action, color: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {log.target_user_id ? log.target_user_id.slice(0, 12) + "..." : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">
                        {log.details ? JSON.stringify(log.details) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
