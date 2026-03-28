import Link from "next/link";
import { SearchX } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <SearchX size={56} className="text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold text-gray-700 mb-2">Product Not Found</h1>
      <p className="text-gray-400 mb-6">
        This listing may have been removed or doesn&apos;t exist.
      </p>
      <Link href="/buy" className="btn-primary">
        Browse Listings
      </Link>
    </div>
  );
}
