"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/products/mutate", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete");
      }
      toast.success("Listing deleted");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 text-sm py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-1"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
    </button>
  );
}
