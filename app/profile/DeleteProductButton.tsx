"use client";

import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteProduct } from "@/lib/services/productService";
import toast from "react-hot-toast";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this listing?")) return;
    setLoading(true);
    try {
      await deleteProduct(productId);
      toast.success("Listing deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="absolute top-2 left-2 bg-white rounded-full p-1.5 shadow hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
      aria-label="Delete listing"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  );
}
