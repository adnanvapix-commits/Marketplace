"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/buy?${params.toString()}`);
  }

  // On mobile show fewer page numbers
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    if (totalPages <= 5) return true;
    return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
  });

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 flex-wrap">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, idx) => {
        const prev = pages[idx - 1];
        return (
          <span key={page} className="flex items-center gap-1 sm:gap-2">
            {prev && page - prev > 1 && (
              <span className="text-gray-400 text-sm px-1">…</span>
            )}
            <button
              onClick={() => goTo(page)}
              className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-primary text-white"
                  : "border border-gray-200 hover:bg-gray-100 text-gray-700"
              }`}
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
