import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import DeleteProductButton from "./DeleteProductButton";
import type { Product } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
          {user.email?.[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-lg">{user.email}</p>
          <p className="text-sm text-gray-400">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* My listings */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        My Listings ({products?.length ?? 0})
      </h2>

      {!products || products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>You haven&apos;t listed anything yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(products as Product[]).map((p) => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
              <DeleteProductButton productId={p.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
