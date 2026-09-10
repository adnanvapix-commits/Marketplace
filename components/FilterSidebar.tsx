"use client";

import { SlidersHorizontal, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, CONDITIONS } from "@/types";

export interface FilterState {
  category: string;
  condition: string;
  brand: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  minQty: string;
  minMoq: string;
  sort: string;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  resultCount: number;
}

export const DEFAULT_FILTERS: FilterState = {
  category: "", condition: "", brand: "", location: "",
  minPrice: "", maxPrice: "", minQty: "", minMoq: "", sort: "alpha",
};

export default function FilterSidebar({ filters, onChange, onClear, resultCount }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  function set(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== "sort" && v !== ""
  ).length;

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="rounded-2xl border border-cream-200 bg-white shadow-soft overflow-hidden">

        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-4 py-3.5 font-semibold text-gray-700 hover:bg-cream-50 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="flex items-center gap-2 text-sm">
            <SlidersHorizontal size={15} className="text-primary" />
            Filters
            {activeCount > 0 && (
              <span className="badge-gold text-[10px] px-2 py-0.5">
                {activeCount}
              </span>
            )}
          </span>
          <span className="md:hidden text-gray-400">
            {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </span>
        </button>

        <div className={`${collapsed ? "hidden" : "block"} md:block px-4 pb-5 space-y-4 border-t border-cream-100`}>

          {/* Results count */}
          <p className="text-xs text-gray-400 pt-3 font-medium">
            <span className="text-primary font-bold">{resultCount.toLocaleString()}</span>
            {" "}result{resultCount !== 1 ? "s" : ""}
          </p>

          {/* Sort */}
          <FilterSection label="Sort By">
            <select
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value)}
              className="input text-sm min-h-[40px] bg-cream-50"
            >
              <option value="alpha">A → Z (Default)</option>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="qty_desc">Most Stock</option>
            </select>
          </FilterSection>

          {/* Category */}
          <FilterSection label="Category">
            <select
              value={filters.category}
              onChange={(e) => set("category", e.target.value)}
              className="input text-sm min-h-[40px] bg-cream-50"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FilterSection>

          {/* Condition */}
          <FilterSection label="Condition">
            <div className="flex flex-wrap gap-1.5">
              {["", ...CONDITIONS].map((c) => (
                <button
                  key={c}
                  onClick={() => set("condition", c)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize font-medium ${
                    filters.condition === c
                      ? "border-primary bg-primary-light text-primary"
                      : "border-cream-200 text-gray-500 hover:border-primary/40 hover:bg-cream-50"
                  }`}
                >
                  {c === "" ? "Any" : c}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Brand */}
          <FilterSection label="Brand">
            <input
              type="text"
              value={filters.brand}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="e.g. Samsung"
              className="input text-sm min-h-[40px] bg-cream-50"
            />
          </FilterSection>

          {/* Price range */}
          <FilterSection label="Price Range ($)">
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => set("minPrice", e.target.value)}
                placeholder="Min"
                className="input text-sm min-h-[40px] bg-cream-50"
                min={0}
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => set("maxPrice", e.target.value)}
                placeholder="Max"
                className="input text-sm min-h-[40px] bg-cream-50"
                min={0}
              />
            </div>
          </FilterSection>

          {/* Location */}
          <FilterSection label="Location / Origin">
            <input
              type="text"
              value={filters.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Dubai, UAE"
              className="input text-sm min-h-[40px] bg-cream-50"
            />
          </FilterSection>

          {/* Min stock */}
          <FilterSection label="Min. Available Stock">
            <input
              type="number"
              value={filters.minQty}
              onChange={(e) => set("minQty", e.target.value)}
              placeholder="e.g. 100"
              className="input text-sm min-h-[40px] bg-cream-50"
              min={1}
            />
          </FilterSection>

          {/* MOQ */}
          <FilterSection label="Max. Order Quantity">
            <input
              type="number"
              value={filters.minMoq}
              onChange={(e) => set("minMoq", e.target.value)}
              placeholder="e.g. 500"
              className="input text-sm min-h-[40px] bg-cream-50"
              min={1}
            />
          </FilterSection>

          {/* Clear */}
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-red-500 hover:text-red-600 py-2.5 border border-red-100 rounded-xl hover:bg-red-50 transition-all font-medium"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
