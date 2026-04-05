import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// POST — create a new product listing
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  // Verify user is verified
  const { data: profile } = await db.from("users").select("is_verified").eq("id", user.id).single();
  if (!profile?.is_verified) {
    return NextResponse.json({ error: "Account not verified" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, price, category, location, brand, quantity, minimum_order_quantity, condition } = body;

  const { error } = await db.from("products").insert({
    user_id: user.id,
    title, description,
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
    console.error("[products/mutate POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// PATCH — update an existing product
export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { productId, title, description, price, category, location, brand, quantity, minimum_order_quantity, condition } = body;

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const db = createAdminClient();

  // Ensure the product belongs to this user
  const { data: existing } = await db.from("products").select("user_id").eq("id", productId).single();
  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await db.from("products").update({
    title, description,
    price: parseFloat(price),
    category, location, brand,
    quantity: parseInt(quantity),
    minimum_order_quantity: parseInt(minimum_order_quantity),
    condition,
  }).eq("id", productId);

  if (error) {
    console.error("[products/mutate PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// DELETE — delete a product
export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const db = createAdminClient();

  // Ensure the product belongs to this user
  const { data: existing } = await db.from("products").select("user_id").eq("id", productId).single();
  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await db.from("products").delete().eq("id", productId);
  if (error) {
    console.error("[products/mutate DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
