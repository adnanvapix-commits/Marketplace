import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ProductsTable from "./ProductsTable";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Admin client — sees all products regardless of RLS
  const db = createAdminClient();
  const { data: products, error } = await db
    .from("products")
    .select("id, title, price, category, is_blocked, created_at, user_id, users(email)")
    .order("created_at", { ascending: false });

  if (error) console.error("[admin/products] fetch error:", error.message);

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Product Management</h1>
        <p className="text-sm text-gray-500 mt-1">{products?.length ?? 0} total products</p>
      </div>

      {error ? (
        <div className="card p-6 text-red-500 text-sm">
          Failed to load products: {error.message}
        </div>
      ) : (
        <ProductsTable initialProducts={products ?? []} adminId={user?.id ?? ""} />
      )}
    </div>
  );
}
