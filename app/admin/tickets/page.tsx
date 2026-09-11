import { createAdminClient } from "@/lib/supabase/admin";
import TicketsTable from "./TicketsTable";

export default async function AdminTicketsPage() {
  const db = createAdminClient();
  let data = [];
  try {
    const { data: rows } = await db
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    data = rows ?? [];
  } catch {
    // Table not yet created — show empty state
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Support Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">
          {(data ?? []).filter(t => t.status === "open").length} open tickets
        </p>
      </div>
      <TicketsTable initialTickets={data ?? []} />
    </div>
  );
}
