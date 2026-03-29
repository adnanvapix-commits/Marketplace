import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";
import type { Product } from "@/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // only owner can edit
    .single();

  if (!product) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Edit Listing</h1>
      <EditProductForm product={product as Product} />
    </div>
  );
}
