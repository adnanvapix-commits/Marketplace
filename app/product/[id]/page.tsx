import Image from "next/image";
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
    .select("*, users(email)")
    .eq("id", id)
    .single();

  if (!product) notFound();
  const p = product as Product;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

        {/* Image — square on mobile, fills column on desktop */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
          <Image
            src={p.image_url}
            alt={p.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {/* Badge + title + price */}
          <div>
            <span className="inline-block text-xs bg-blue-100 text-primary px-3 py-1 rounded-full font-medium">
              {p.category}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-2 leading-tight">
              {p.title}
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-primary mt-1">
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
          </div>

          {/* Description */}
          <div className="border-t pt-4">
            <h2 className="font-semibold text-gray-700 mb-2 text-sm">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {p.description}
            </p>
          </div>

          {/* Seller */}
          <div className="card p-4 flex items-center gap-3 bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Seller</p>
              <p className="font-medium text-gray-700 text-sm truncate">
                {p.users?.email?.split("@")[0] ?? "Unknown"}
              </p>
              <p className="text-xs text-gray-400 truncate">{p.users?.email}</p>
            </div>
          </div>

          {/* CTA */}
          <ChatButton sellerId={p.user_id} productId={p.id} />
        </div>
      </div>
    </div>
  );
}
