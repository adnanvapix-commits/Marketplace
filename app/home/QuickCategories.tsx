"use client";

import Link from "next/link";
import { CATEGORIES } from "@/types";

export default function QuickCategories() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((category) => (
        <Link
          key={category}
          href={`/buy?category=${encodeURIComponent(category)}`}
          className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium hover:bg-primary/20 whitespace-nowrap"
        >
          {category}
        </Link>
      ))}
    </div>
  );
}
