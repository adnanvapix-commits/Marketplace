"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Loader2, ShoppingBag } from "lucide-react";
import FilterSidebar, { DEFAULT_FILTERS, type FilterState } from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { useDebounce } from "@/lib/hooks/useDebounce";
import type { Product } from "@/types";

/* ── Inner component (needs useSearchParams inside Suspense) ── */
function BuyPageInner() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    category: searchParams.get("category") || "",
  });
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(
    !!(searchParams.get("q") || searchParams.get("category"))
  );
  const [error, setError] = useState("");

  // Debounce text inputs — 400ms delay
  const debouncedQuery    = useDebounce(query, 400);
  const debouncedBrand    = useDebounce(filters.brand, 400);
  const debouncedLocation = useDebounce(filters.location, 400);

  const hasAnyFilter = !!(
    debouncedQuery || filters.category || filters.condition ||
    debouncedBrand || debouncedLocation ||
    filters.minPrice || filters.maxPrice || filters.minQty || filters.minMoq
  );

  const fetchProducts = useCallback(async () => {
    if (!hasAnyFilter) {
      setSearched(false);
      setProducts([]);
      setCount(0);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    const params = new URLSearchParams();
    if (debouncedQuery)    params.set("q", debouncedQuery);
    if (filters.category)  params.set("category", filters.category);
    if (filters.condition) params.set("condition", filters.condition);
    if (debouncedBrand)    params.set("brand", debouncedBrand);
    if (debouncedLocation) params.set("location", debouncedLocation);
    if (filters.minPrice)  params.set("minPrice", filters.minPrice);
    if (filters.maxPrice)  params.set("maxPrice", filters.maxPrice);
    if (filters.minQty)    params.set("minQty", filters.minQty);
    if (filters.minMoq)    params.set("minMoq", filters.minMoq);
    params.set("sort", filters.sort);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/products/search?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to fetch products");
        setProducts([]);
        setCount(0);
        return;
      }
      const data = await res.json();
      setProducts(data.products);
      setCount(data.count);
      setTotalPages(data.totalPages);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, debouncedBrand, debouncedLocation, filters, page, hasAnyFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedQuery, debouncedBrand, debouncedLocation,
    filters.category, filters.condition, filters.minPrice,
    filters.maxPrice, filters.minQty, filters.minMoq, filters.sort,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function clearAll() {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      {/* Search bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          {loading
            ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} />
            : <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          }
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name, brand, keyword..."
            className="input pl-10 min-h-[48px] text-sm md:text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={(f) => { setFilters(f); setPage(1); }}
          onClear={clearAll}
          resultCount={count}
        />

        {/* Results area */}
        <div className="flex-1 min-w-0">

          {/* Prompt — nothing searched yet */}
          {!searched && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Search size={34} className="text-gray-300" />
              </div>
              <h2 className="text-base font-semibold text-gray-600 mb-2">
                Search the B2B Marketplace
              </h2>
              <p className="text-sm max-w-xs">
                Enter a product name, brand, or use the filters to find verified listings.
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="card p-6 text-center text-red-500 text-sm">{error}</div>
          )}

          {/* Results */}
          {!loading && searched && !error && (
            <>
              {/* Meta row */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{count.toLocaleString()}</span>{" "}
                  product{count !== 1 ? "s" : ""} found
                  {debouncedQuery && (
                    <span> for{" "}
                      <span className="font-medium text-gray-700">&quot;{debouncedQuery}&quot;</span>
                    </span>
                  )}
                </p>
                {hasAnyFilter && (
                  <button onClick={clearAll} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>

              {/* Empty */}
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <ShoppingBag size={48} className="mb-4 opacity-20" />
                  <p className="font-medium text-gray-600">No products found</p>
                  <p className="text-sm mt-1">Try different keywords or adjust your filters</p>
                  <button onClick={clearAll} className="btn-outline text-sm mt-4">Clear Filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <ClientPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* Client-side pagination (no URL changes needed) */
function ClientPagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 text-sm"
      >
        ‹
      </button>

      {pages.map((p, idx) => (
        <span key={p} className="flex items-center gap-1.5">
          {pages[idx - 1] && p - pages[idx - 1] > 1 && (
            <span className="text-gray-400 text-sm">…</span>
          )}
          <button
            onClick={() => onPageChange(p)}
            className={`min-w-[40px] min-h-[40px] rounded-lg text-sm font-medium transition-colors ${
              p === currentPage
                ? "bg-primary text-white"
                : "border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 text-sm"
      >
        ›
      </button>
    </div>
  );
}

/* Wrap in Suspense for useSearchParams */
export default function BuyPage() {
  return (
    <Suspense>
      <BuyPageInner />
    </Suspense>
  );
}
