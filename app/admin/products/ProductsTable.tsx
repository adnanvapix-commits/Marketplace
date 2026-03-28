"use client";

import { useState } from "react";
import { Search, Trash2, EyeOff, Eye, Loader2 } from "lucide-react";
import type { AdminProduct } from "@/lib/services/adminService";
import toast from "react-hot-toast";

interface Props {
  initialProducts: AdminProduct[];
  adminId: string;
}

export default function ProductsTable({ initialProducts, adminId }: Props) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.users?.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(product: AdminProduct) {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setLoading(product.id);
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Product deleted");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleBlock(product: AdminProduct) {
    setLoading(product.id);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, is_blocked: !product.is_blocked }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_blocked: !p.is_blocked } : p));
      toast.success(product.is_blocked ? "Product unblocked" : "Product blocked");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-3 sm:p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or seller..." className="input pl-9 text-sm min-h-[40px]" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Title","Price","Category","Seller","Date","Status","Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No products found</td></tr>
            ) : filtered.map((product) => (
              <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${product.is_blocked ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{product.title}</td>
                <td className="px-4 py-3 text-primary font-semibold">${product.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{product.category}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">
                  {product.users?.email ?? product.user_id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(product.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.is_blocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {product.is_blocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {loading === product.id ? (
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    ) : (
                      <>
                        <button onClick={() => handleBlock(product)}
                          className={`p-1.5 rounded-lg transition-colors ${product.is_blocked ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}
                          title={product.is_blocked ? "Unblock" : "Block"}>
                          {product.is_blocked ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => handleDelete(product)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
