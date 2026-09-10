"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2, ShoppingBag, PlusCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import FilterSidebar, { DEFAULT_FILTERS, type FilterState } from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { useDebounce } from "@/lib/hooks/useDebounce";
import VerificationBanner from "./VerificationBanner";
import toast from "react-hot-toast";
import type { Product } from "@/types";

// Simple in-memory cache keyed by URL params string
const cache = new Map<string, { products: Product[]; count: number; totalPages: number; ts: number }>();
const CACHE_TTL = 30_000; // 30 s

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, hydrated, isVerified } = useAuthStore();
  const isLoggedIn = hydrated && !!user;

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
  const [error, setError] = useState("");

  const debouncedQuery    = useDebounce(query, 300);
  const debouncedBrand    = useDebounce(filters.brand, 300);
  const debouncedLocation = useDebounce(filters.location, 300);

  // Abort controller ref — cancel in-flight requests when filters change
  const abortRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async () => {
    // Cancel previous fetch
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

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

    const cacheKey = params.toString();

    // Serve from cache if fresh
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setProducts(cached.products);
      setCount(cached.count);
      setTotalPages(cached.totalPages);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/products/search?${cacheKey}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const e = await res.json();
        setError(e.error ?? "Failed");
        setProducts([]);
        return;
      }

      const data = await res.json();
      cache.set(cacheKey, { products: data.products, count: data.count, totalPages: data.totalPages, ts: Date.now() });
      setProducts(data.products);
      setCount(data.count);
      setTotalPages(data.totalPages);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, debouncedBrand, debouncedLocation, filters, page]);

  useEffect(() => { setPage(1); }, [
    debouncedQuery, debouncedBrand, debouncedLocation,
    filters.category, filters.condition, filters.minPrice,
    filters.maxPrice, filters.minQty, filters.minMoq, filters.sort,
  ]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function clearAll() { setQuery(""); setFilters(DEFAULT_FILTERS); setPage(1); }

  function handleBuy() {
    if (!isLoggedIn || !isVerified) {
      toast.error("You need admin verification to access this feature.");
      return;
    }
    router.push("/buy");
  }

  function handleSell() {
    if (!isLoggedIn || !isVerified) {
      toast.error("You need admin verification to sell products.");
      return;
    }
    router.push("/sell");
  }

  const showBanner = hydrated && isLoggedIn && !isVerified;

  return (
    <div>
      {showBanner && <VerificationBanner />}

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Search bar */}
        <div className="mb-3">
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
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Buy / Sell */}
        <div className="flex gap-3 mb-5">
          <button onClick={handleBuy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
            <ShoppingBag size={16} /> Buy
          </button>
          <button onClick={handleSell}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
            <PlusCircle size={16} /> Sell
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <FilterSidebar
            filters={filters}
            onChange={(f) => { setFilters(f); setPage(1); }}
            onClear={clearAll}
            resultCount={count}
          />

          <div className="flex-1 min-w-0">
            {/* Skeleton */}
            {loading && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-20 rounded-2xl" />
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="card p-6 text-center">
                <p className="text-red-500 text-sm font-medium">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{count.toLocaleString()}</span>{" "}
                    product{count !== 1 ? "s" : ""} found
                    {debouncedQuery && <span> for <span className="font-medium text-gray-700">&quot;{debouncedQuery}&quot;</span></span>}
                  </p>
                  <button onClick={clearAll} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <X size={12} /> Clear all
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-gray-600">No products found</p>
                    <p className="text-sm mt-1">Try different keywords or adjust your filters</p>
                    <button onClick={clearAll} className="btn-outline text-sm mt-4">Clear Filters</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}

                {totalPages > 1 && (
                  <HomePagination
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
    </div>
  );
}

function HomePagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);
  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-cream-200 hover:bg-cream-100 disabled:opacity-40 text-sm">‹</button>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center gap-1.5">
          {pages[idx - 1] && p - pages[idx - 1] > 1 && <span className="text-gray-400 text-sm">…</span>}
          <button onClick={() => onPageChange(p)}
            className={`min-w-[40px] min-h-[40px] rounded-xl text-sm font-medium transition-colors ${p === currentPage ? "bg-primary text-white" : "border border-cream-200 hover:bg-cream-100"}`}>
            {p}
          </button>
        </span>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-cream-200 hover:bg-cream-100 disabled:opacity-40 text-sm">›</button>
    </div>
  );
}

export default function HomeClient() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
