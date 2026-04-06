import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiverId, productId, message } = await req.json();

  if (!receiverId || !productId || !message?.trim()) {
    return NextResponse.json({ error: "receiverId, productId and message are required" }, { status: 400 });
  }

  const db = createAdminClient();
  const { error } = await db.from("messages").insert({
    sender_id: user.id,
    receiver_id: receiverId,
    product_id: productId,
    message: message.trim(),
  });

  if (error) {
    console.error("[chat/send]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
