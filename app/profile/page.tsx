import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, User } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import type { Product } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("users").select("company_name, created_at").eq("id", user.id).single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Profile header */}
      <div className="card p-5 sm:p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <User size={24} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {profileData?.company_name || user.email?.split("@")[0]}
          </p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          My Listings ({products?.length ?? 0})
        </h2>
        <Link href="/sell" className="btn-primary text-sm flex items-center gap-1.5 py-2">
          <PlusCircle size={15} /> New Listing
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="mb-4">You haven&apos;t listed anything yet.</p>
          <Link href="/sell" className="btn-primary text-sm">Post Your First Listing</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(products as Product[]).map((p) => (
            <div key={p.id} className="card overflow-hidden">
              {/* Image */}
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={p.image_url}
                  alt={p.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                  p.condition === "new" ? "bg-green-100 text-green-700" :
                  p.condition === "used" ? "bg-yellow-100 text-yellow-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {p.condition}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate text-sm">{p.title}</h3>
                <p className="text-primary font-bold mt-0.5">${p.price.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {p.category}
                  </span>
                  <span className="text-xs text-gray-400">Qty: {p.quantity}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/product/${p.id}/edit`}
                    className="flex-1 text-center text-sm py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton productId={p.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
