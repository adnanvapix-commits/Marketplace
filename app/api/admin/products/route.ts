import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const db = createAdminClient();
  const { data: profile } = await db.from("users").select("role, email").eq("id", user.id).single();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  return (profile?.role === "admin" || profile?.email === adminEmail) ? user : null;
}

// DELETE /api/admin/products?id=xxx
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("admin_logs").insert({
    admin_id: admin.id,
    action: "delete_product",
    target_product_id: id,
  });

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/products — block/unblock
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { productId, is_blocked } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from("products").update({ is_blocked }).eq("id", productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("admin_logs").insert({
    admin_id: admin.id,
    action: is_blocked ? "block_product" : "unblock_product",
    target_product_id: productId,
  });

  return NextResponse.json({ success: true });
}
