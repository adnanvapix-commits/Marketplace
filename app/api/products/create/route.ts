import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch fresh verification status
  const db = createAdminClient();
  const { data: profile } = await db
    .from("users")
    .select("is_verified")
    .eq("id", user.id)
    .single();

  if (!profile?.is_verified) {
    return NextResponse.json({ error: "Account not verified" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, price, category, location, brand, quantity, minimum_order_quantity, condition } = body;

  const { error } = await db.from("products").insert({
    user_id: user.id,
    title,
    description,
    price: parseFloat(price),
    category,
    location: location || "Dubai, UAE",
    brand: brand || "",
    quantity: parseInt(quantity),
    minimum_order_quantity: parseInt(minimum_order_quantity) || 1,
    condition,
    image_url: "",
    is_active: true,
  });

  if (error) {
    console.error("[products/create] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
