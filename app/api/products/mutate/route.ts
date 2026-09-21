import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPooledAdminClient as createAdminClient } from "@/lib/supabase/admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  // Verify user is verified via DB (not user_metadata)
  const { data: profile } = await db.from("users").select("is_verified").eq("id", user.id).single();
  if (!profile?.is_verified)
    return NextResponse.json({ error: "Account not verified" }, { status: 403 });

  const body = await req.json();
  const { title, description, price, category, location, brand, quantity, minimum_order_quantity, condition, image_url } = body;

  // Input validation
  if (!title?.trim() || !description?.trim() || !category || !condition)
    return NextResponse.json({ error: "title, description, category and condition are required" }, { status: 400 });

  const parsedPrice = parseFloat(price);
  const parsedQty   = parseInt(quantity);
  const parsedMoq   = parseInt(minimum_order_quantity) || 1;

  if (isNaN(parsedPrice) || parsedPrice <= 0)
    return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
  if (isNaN(parsedQty) || parsedQty < 1)
    return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
  if (parsedMoq < 1 || parsedMoq > parsedQty)
    return NextResponse.json({ error: "Minimum order quantity must be between 1 and available quantity" }, { status: 400 });

  const { error } = await db.from("products").insert({
    user_id:   user.id,
    title:     title.trim(),
    description: description.trim(),
    price:     parsedPrice,
    category,
    location:  location?.trim() || "Dubai, UAE",
    brand:     brand?.trim() || "",
    quantity:  parsedQty,
    minimum_order_quantity: parsedMoq,
    condition,
    image_url: typeof image_url === "string" && image_url.startsWith("https://res.cloudinary.com/") ? image_url : "",
    is_active: true,
    expires_at: new Date(Date.now() + 90 * 86400000).toISOString(), // 90 days from now
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PATCH — update an existing product
export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { productId, title, description, price, category, location, brand, quantity, minimum_order_quantity, condition } = body;

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  if (!UUID_REGEX.test(productId)) return NextResponse.json({ error: "Invalid productId" }, { status: 400 });

  const parsedPrice = parseFloat(price);
  const parsedQty   = parseInt(quantity);
  const parsedMoq   = parseInt(minimum_order_quantity) || 1;

  if (isNaN(parsedPrice) || parsedPrice <= 0)
    return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
  if (isNaN(parsedQty) || parsedQty < 1)
    return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });

  const db = createAdminClient();

  // Ownership check — return 404 if not found, 403 if not owner
  const { data: existing } = await db.from("products").select("user_id").eq("id", productId).single();
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (existing.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await db.from("products").update({
    title: title?.trim(), description: description?.trim(),
    price: parsedPrice, category,
    location: location?.trim(), brand: brand?.trim(),
    quantity: parsedQty,
    minimum_order_quantity: parsedMoq,
    condition,
  }).eq("id", productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — delete a product
export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  if (!UUID_REGEX.test(productId)) return NextResponse.json({ error: "Invalid productId" }, { status: 400 });

  const db = createAdminClient();

  const { data: existing } = await db.from("products").select("user_id").eq("id", productId).single();
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (existing.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await db.from("products").delete().eq("id", productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
