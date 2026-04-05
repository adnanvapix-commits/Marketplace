import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  // Verify the caller is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { full_name, company_name, phone, whatsapp_number, country, avatar_url } = body;

  if (!full_name?.trim()) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }

  const updatePayload: Record<string, string> = {
    full_name: full_name.trim(),
  };
  if (company_name?.trim()) updatePayload.company_name = company_name.trim();
  if (phone?.trim()) updatePayload.phone = phone.trim();
  if (country?.trim()) updatePayload.country = country.trim();
  if (avatar_url?.trim()) updatePayload.avatar_url = avatar_url.trim();

  // Use admin client to bypass RLS
  const db = createAdminClient();
  const { error } = await db.from("users").update(updatePayload).eq("id", user.id);

  if (error) {
    console.error("[profile/update] DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
