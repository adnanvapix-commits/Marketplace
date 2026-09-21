import { createClient } from "@/lib/supabase/server";
import { createPooledAdminClient as createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Building2, MapPin, ShieldCheck, Package, Eye } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import type { Product, SubscriptionTier } from "@/types";

export const revalidate = 60;

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();

  // Fetch seller profile + their products in parallel
  const [sellerRes, productsRes] = await Promise.all([
    db.from("users")
      .select("id, full_name, company_name, country, created_at, is_verified, subscription_tier, avatar_url")
      .eq("id", id)
      .single(),
    db.from("products")
      .select("id, title, price, condition, quantity, minimum_order_quantity, category, brand, location, created_at, user_id, view_count")
      .eq("user_id", id)
      .eq("is_active", true)
      .eq("is_blocked", false)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!sellerRes.data) notFound();

  const seller = sellerRes.data;
  const products = (productsRes.data ?? []) as unknown as Product[];
  const totalViews = products.reduce((sum, p) => sum + ((p as Product & { view_count?: number }).view_count ?? 0), 0);

  // Check if current user is authenticated (to show chat button)
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const joinedDate = new Date(seller.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Seller header card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {seller.avatar_url ? (
            <img src={seller.avatar_url} alt={seller.full_name ?? "Seller"} className="w-16 h-16 rounded-full object-cover border-2 border-cream-200 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Building2 size={28} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-800 truncate">
                {seller.company_name || seller.full_name || "Verified Seller"}
              </h1>
              {seller.is_verified && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <ShieldCheck size={11} /> Verified
                </span>
              )}
              {seller.subscription_tier && (
                <SubscriptionBadge tier={seller.subscription_tier as SubscriptionTier} size="sm" />
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
              {seller.country && (
                <span className="flex items-center gap-1"><MapPin size={11} /> {seller.country}</span>
              )}
              <span className="flex items-center gap-1"><Package size={11} /> {products.length} listings</span>
              {totalViews > 0 && (
                <span className="flex items-center gap-1"><Eye size={11} /> {totalViews.toLocaleString()} total views</span>
              )}
              <span>Member since {joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div>
        <h2 className="font-bold text-gray-800 mb-4 text-base">
          Listings <span className="text-gray-400 font-normal text-sm">({products.length})</span>
        </h2>

        {products.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            <Package size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No active listings</p>
            {currentUser && (
              <Link href="/home" className="btn-primary text-sm inline-block mt-4">Browse Other Sellers</Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
