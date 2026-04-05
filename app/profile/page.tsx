import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, User, Pencil } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import VerificationBadge from "@/components/VerificationBadge";
import type { Product } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users").select("*").eq("id", user.id).single();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, condition, quantity, minimum_order_quantity, category")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const roles: string[] = profile?.roles ?? [profile?.role ?? "buyer"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">

      {/* Profile card */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" width={64} height={64}
                className="rounded-full object-cover w-full h-full" />
            ) : (
              <User size={28} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800 truncate">
              {profile?.full_name || profile?.company_name || user.email?.split("@")[0]}
            </h1>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
            {profile?.company_name && profile?.full_name && (
              <p className="text-sm text-gray-600 mt-0.5">{profile.company_name}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map((r) => (
                <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                  {r}
                </span>
              ))}
              <VerificationBadge isVerified={profile?.is_verified ?? false} />
              {profile?.is_subscribed && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">✓ Subscribed</span>
              )}
            </div>
          </div>

          <Link href="/profile/edit"
            className="btn-outline text-sm flex items-center gap-1.5 shrink-0 self-start sm:self-center">
            <Pencil size={14} /> Edit Profile
          </Link>
        </div>

        {/* Details */}
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
              <div key={p.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate text-sm">{p.title}</h3>
                    <p className="text-primary font-bold mt-0.5">${p.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        p.condition === "new" ? "bg-green-100 text-green-700" :
                        p.condition === "used" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"}`}>
                        {p.condition}
                      </span>
                      <span className="text-xs text-gray-400">{p.category}</span>
                      <span className="text-xs text-gray-400">Qty: {p.quantity}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/product/${p.id}/edit`}
                    className="flex-1 text-center text-sm py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium">
                    Edit
                  </Link>
                  <DeleteProductButton productId={p.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
