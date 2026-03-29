"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/cloudinary";
import { CATEGORIES, CONDITIONS, type Product } from "@/types";
import toast from "react-hot-toast";

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [category, setCategory] = useState(product.category);
  const [location, setLocation] = useState(product.location ?? "");
  const [brand, setBrand] = useState(product.brand ?? "");
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [moq, setMoq] = useState(String(product.minimum_order_quantity));
  const [condition, setCondition] = useState<Product["condition"]>(product.condition);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "uploading" | "saving" | "done">("idle");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStep("uploading");

    try {
      let imageUrl = product.image_url;

      // Only upload new image if user selected one
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      setStep("saving");
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .update({
          title,
          description,
          price: parseFloat(price),
          category,
          location,
          brand,
          quantity: parseInt(quantity),
          minimum_order_quantity: parseInt(moq),
          condition,
          image_url: imageUrl,
        })
        .eq("id", product.id);

      if (error) throw error;

      setStep("done");
      toast.success("Listing updated!");
      setTimeout(() => router.push("/profile"), 1000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  }

  const stepLabel =
    step === "uploading" ? "Uploading image..." :
    step === "saving" ? "Saving..." :
    step === "done" ? "Updated!" : "Save Changes";

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-7 space-y-5">

      {/* Image */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Product Image</label>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2">
          <Image
            src={preview ?? product.image_url}
            alt={product.title}
            fill
            className="object-cover"
          />
          {preview && (
            <button type="button" onClick={() => { setPreview(null); setImageFile(null); }}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X size={14} />
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
          <Upload size={15} /> Change image
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      {/* Title */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="input min-h-[44px]" required maxLength={100} />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          className="input resize-none" rows={4} required />
      </div>

      {/* Brand + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Brand</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
            className="input min-h-[44px]" placeholder="e.g. Samsung" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="input min-h-[44px]" required>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Condition *</label>
        <div className="flex gap-2 flex-wrap">
          {CONDITIONS.map((c) => (
            <button key={c} type="button" onClick={() => setCondition(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all capitalize ${
                condition === c ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price + Qty + MOQ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Price ($) *</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
            className="input min-h-[44px]" min={0} step={0.01} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Quantity *</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
            className="input min-h-[44px]" min={1} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Min. Order</label>
          <input type="number" value={moq} onChange={(e) => setMoq(e.target.value)}
            className="input min-h-[44px]" min={1} />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Location</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          className="input min-h-[44px]" placeholder="e.g. Shenzhen, China" />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="btn-primary flex-1 min-h-[48px] flex items-center justify-center gap-2">
          {loading && step !== "done" && <Loader2 size={16} className="animate-spin" />}
          {step === "done" && <CheckCircle size={16} />}
          {stepLabel}
        </button>
        <button type="button" onClick={() => router.back()}
          className="btn-outline flex-1 min-h-[48px]">
          Cancel
        </button>
      </div>
    </form>
  );
}
