"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Package, Tag, ArrowRight } from "lucide-react";
import type { Product } from "@/types";

const conditionConfig: Record<string, { label: string; cls: string }> = {
  new:         { label: "New",         cls: "badge-green" },
  used:        { label: "Used",        cls: "badge-amber" },
  refurbished: { label: "Refurbished", cls: "badge-blue" },
};

const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const condition = conditionConfig[product.condition] ?? { label: product.condition, cls: "badge" };

  return (
    <Link
      href={`/product/${product.id}`}
      className="card group flex flex-row items-stretch gap-0 overflow-hidden transition-all duration-200 hover:shadow-cream-md hover:-translate-y-0.5 hover:border-primary/20"
    >
      {/* Image / placeholder */}
      <div className="w-20 sm:w-24 shrink-0 bg-cream-100 relative overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={24} className="text-cream-400 opacity-60" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0 p-3">
        {/* Title + condition */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <span className={`${condition.cls} shrink-0 text-[10px]`}>{condition.label}</span>
        </div>

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Tag size={10} className="shrink-0 text-primary/50" />
            {product.brand}
          </p>
        )}

        {/* Price + meta */}
        <div className="flex items-end justify-between mt-auto pt-1 border-t border-cream-100">
          <div>
            <p className="text-base font-bold text-primary leading-none">
              ${product.price.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              MOQ: {product.minimum_order_quantity} units
            </p>
          </div>

          <div className="text-right flex flex-col items-end gap-0.5">
            <p className="text-xs text-gray-500 flex items-center gap-0.5">
              <Package size={10} className="shrink-0" />
              {product.quantity.toLocaleString()} in stock
            </p>
            {product.location && (
              <p className="text-xs text-gray-400 flex items-center gap-0.5">
                <MapPin size={9} className="shrink-0" />
                <span className="truncate max-w-[90px]">{product.location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Seller */}
        {product.users && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-gray-400 truncate">
              {product.users.company_name || product.users.email?.split("@")[0]}
            </p>
            <ArrowRight size={12} className="text-primary/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        )}
      </div>
    </Link>
  );
});

export default ProductCard;
