import { notFound } from "next/navigation";
import { MapPin, Calendar, Tag, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ChatButton from "./ChatButton";
import type { Product } from "@/types";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, users(email, company_name)")
    .eq("id", id)
    .single();

  if (!product) notFound();
  const p = product as Product;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
      <div className="card p-5 sm:p-7 flex flex-col gap-5">

        {/* Badge + title + price */}
        <div>
          <span className="inline-block text-xs bg-blue-100 text-primary px-3 py-1 rounded-full font-medium">
            {p.category}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 leading-tight">
            {p.title}
          </h1>
          <p className="text-2xl font-bold text-primary mt-1">
            ${p.price.toLocaleString()}
          </p>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
          {p.location && (
            <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-xs">
              <MapPin size={12} className="text-primary shrink-0" /> {p.location}
            </span>
          )}
          <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-xs">
            <Calendar size={12} className="text-primary shrink-0" />
            {new Date(p.created_at).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-xs">
            <Tag size={12} className="text-primary shrink-0" /> {p.category}
          </span>
          {p.brand && (
            <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-xs">
              <Tag size={12} className="text-primary shrink-0" /> {p.brand}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Available Qty</p>
            <p className="font-semibold text-gray-800">{p.quantity.toLocaleString()} units</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Min. Order</p>
            <p className="font-semibold text-gray-800">{p.minimum_order_quantity} units</p>
          </div>
        </div>

        {/* Description */}
        <div className="border-t pt-4">
          <h2 className="font-semibold text-gray-700 mb-2 text-sm">Description</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {p.description}
          </p>
        </div>

        {/* Seller — no email shown */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Seller</p>
            <p className="font-medium text-gray-700 text-sm truncate">
              {p.users?.company_name || p.users?.email?.split("@")[0] || "Verified Seller"}
            </p>
          </div>
        </div>

        {/* CTA */}
        <ChatButton sellerId={p.user_id} productId={p.id} />
      </div>
    </div>
  );
}
