import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Pencil } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import type { Product } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const roles: string[] = profile?.roles ?? [profile?.role ?? "buyer"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">

      {/* Profile card */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile?.avatar_url ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20">
                <Image src={profile.avatar_url} alt="Avatar" width={80} height={80}
                  className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                {(profile?.full_name || user.email)?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800 truncate">
              {profile?.full_name || profile?.company_name || user.email?.split("@")[0]}
            </h1>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
            {profile?.company_name && (
              <p className="text-sm text-gray-600 mt-0.5">{profile.company_name}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map((r) => (
                <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Edit button */}
          <Link href="/profile/edit"
            className="btn-outline text-sm flex items-center gap-1.5 shrink-0 self-start sm:self-center">
            <Pencil size={14} /> Edit Profile
          </Link>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: "Phone", value: profile?.phone },
            { label: "Country", value: profile?.country },
            { label: "Member Since", value: new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm font-medium text-gray-700">{value || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* My Listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">
            My Listings <span className="text-gray-400 font-normal text-sm">({products?.length ?? 0})</span>
          </h2>
          <Link href="/sell" className="btn-primary text-sm flex items-center gap-1.5 py-2">
            <PlusCircle size={14} /> New Listing
          </Link>
        </div>

        {!products || products.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            <p className="mb-4 text-sm">No listings yet</p>
            <Link href="/sell" className="btn-primary text-sm">Post Your First Listing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(products as Product[]).map((p) => (
              <div key={p.id} className="card overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                  <Image src={p.image_url} alt={p.title} fill className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw" />
                  <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    p.condition === "new" ? "bg-green-100 text-green-700" :
                    p.condition === "used" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"}`}>
                    {p.condition}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate text-sm">{p.title}</h3>
                  <p className="text-primary font-bold mt-0.5">${p.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Qty: {p.quantity} · MOQ: {p.minimum_order_quantity}</p>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/product/${p.id}/edit`}
                      className="flex-1 text-center text-sm py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium">
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
    </div>
  );
}
