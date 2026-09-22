"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, PlusCircle, ShoppingBag } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import type { Product } from "@/types";

interface Props {
  products: Product[];
}

export default function ManageListings({ products }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? products.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-gray-800">
          My Listings{" "}
          <span className="text-gray-400 font-normal text-sm">
            ({filtered.length}{query ? ` of ${products.length}` : ""})
          </span>
        </h2>
        <Link href="/sell" className="btn-primary text-sm flex items-center gap-1.5 py-2 shrink-0">
          <PlusCircle size={14} /> New Listing
        </Link>
      </div>

      {/* Search */}
      {products.length > 0 && (
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings by title or category..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-cream-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Empty states */}
      {products.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          <ShoppingBag size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm mb-4">No listings yet</p>
          <Link href="/sell" className="btn-primary text-sm">Post Your First Listing</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <Search size={28} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No listings match &quot;{query}&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 truncate text-sm">{p.title}</h3>
                <p className="text-primary font-bold mt-0.5">
                  AED {p.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    p.condition === "new"  ? "bg-green-100 text-green-700" :
                    p.condition === "used" ? "bg-yellow-100 text-yellow-700" :
                                            "bg-blue-100 text-blue-700"
                  }`}>
                    {p.condition}
                  </span>
                  <span className="text-xs text-gray-400">{p.category}</span>
                  <span className="text-xs text-gray-400">Qty: {p.quantity}</span>
                </div>
              </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
