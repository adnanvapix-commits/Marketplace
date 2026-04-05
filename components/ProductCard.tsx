"use client";

import { memo } from "react";
import Link from "next/link";
import { MapPin, Package, Tag } from "lucide-react";
import type { Product } from "@/types";

const conditionColor = {
  new: "bg-green-100 text-green-700",
  used: "bg-yellow-100 text-yellow-700",
  refurbished: "bg-blue-100 text-blue-700",
};

const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`}
      className="card group hover:shadow-md transition-shadow flex flex-row items-start gap-3 p-3">

      {/* Condition badge — left side */}
      <div className="shrink-0 mt-0.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${conditionColor[product.condition] ?? "bg-gray-100 text-gray-600"}`}>
          {product.condition}
        </span>
      </div>

      {/* Info — right side */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.title}
        </h3>

        {product.brand && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Tag size={10} className="shrink-0" /> {product.brand}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <div>
            <p className="text-sm font-bold text-primary">${product.price.toLocaleString()}</p>
            <p className="text-xs text-gray-400">MOQ: {product.minimum_order_quantity} units</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 flex items-center gap-0.5 justify-end">
              <Package size={10} className="shrink-0" /> {product.quantity.toLocaleString()}
            </p>
            {product.location && (
              <p className="text-xs text-gray-400 flex items-center gap-0.5 justify-end">
                <MapPin size={9} className="shrink-0" />
                <span className="truncate max-w-[80px]">{product.location}</span>
              </p>
            )}
          </div>
        </div>

        {product.users && (
          <p className="text-xs text-gray-400 border-t pt-1 truncate">
            {product.users.company_name || product.users.email?.split("@")[0]}
          </p>
        )}
      </div>
    </Link>
  );
});

export default ProductCard;
