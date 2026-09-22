import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Returns count of unread messages — requires auth (subscription not enforced here
// since the count badge in the navbar should always show, even for users
// whose subscription just expired, so they know they have pending messages)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0 });

  const db = createAdminClient();
  const { count } = await db
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  return NextResponse.json({ count: count ?? 0 });
}
