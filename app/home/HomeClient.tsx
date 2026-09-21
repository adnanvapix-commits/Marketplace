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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Autocomplete suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) { setSuggestions([]); return; }
    fetch(`/api/products/suggest?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json())
      .then(({ suggestions: s }) => setSuggestions(s ?? []))
      .catch(() => {});
  }, [debouncedQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        {/* Search bar with autocomplete */}
        <div className="mb-3 relative" ref={searchRef}>
          <div className="relative">
            {loading
              ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} />
              : <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            }
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search by product name, brand, keyword..."
              className="input pl-10 min-h-[48px] text-sm md:text-base"
            />
            {query && (
              <button onClick={() => { setQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-soft-md border border-cream-200 z-20 mt-1 overflow-hidden">
              {suggestions.map((s) => (
                <button key={s} onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setQuery(s); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50 flex items-center gap-2 transition-colors">
                  <Search size={12} className="text-gray-400 shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy / Sell quick actions — shown only to verified users */}
        {hydrated && isLoggedIn && isVerified && (
          <div className="flex gap-2 mb-4">
            <button onClick={handleBuy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
              <ShoppingBag size={15} /> Browse All
            </button>
            <button onClick={handleSell}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
              <PlusCircle size={15} /> Post Listing
            </button>
          </div>
        )}

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
                  <div key={i} className="card flex gap-0 overflow-hidden h-20 animate-pulse">
                    <div className="w-20 bg-cream-200 shrink-0" />
                    <div className="flex-1 p-3 space-y-2">
                      <div className="h-4 bg-cream-200 rounded w-3/4" />
                      <div className="h-3 bg-cream-100 rounded w-1/2" />
                      <div className="h-3 bg-cream-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={24} className="text-red-400" />
                </div>
                <p className="text-red-500 text-sm font-semibold mb-1">Could not load listings</p>
                <p className="text-gray-400 text-xs mb-4">{error}</p>
                <button onClick={fetchProducts} className="btn-primary text-sm">Try Again</button>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Meta row */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{count.toLocaleString()}</span>{" "}
                    product{count !== 1 ? "s" : ""} found
                    {debouncedQuery && (
                      <span> for <span className="font-medium text-gray-700">&quot;{debouncedQuery}&quot;</span></span>
                    )}
                  </p>
                  <button onClick={clearAll} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <X size={12} /> Clear all
                  </button>
                </div>

                {/* Empty state */}
                {products.length === 0 ? (
                  <div className="card p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={28} className="text-gray-300" />
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">No products found</p>
                    <p className="text-sm text-gray-400 mb-5">
                      {debouncedQuery
                        ? `No results for "${debouncedQuery}". Try different keywords.`
                        : "Try adjusting your filters."}
                    </p>
                    <button onClick={clearAll} className="btn-outline text-sm">Clear Filters</button>
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
