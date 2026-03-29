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
      <div className="card overflow-hidden">
        {/* Header */}
        <button
          className="w-full flex items-center justify-between p-4 font-semibold text-gray-700"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="flex items-center gap-2 text-sm">
            <SlidersHorizontal size={15} />
            Filters
            {activeCount > 0 && (
              <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </span>
          <span className="md:hidden text-gray-400">
            {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </span>
        </button>

        <div className={`${collapsed ? "hidden" : "block"} md:block px-4 pb-4 space-y-4 border-t border-gray-100`}>

          {/* Results count */}
          <p className="text-xs text-gray-400 pt-3">
            {resultCount.toLocaleString()} result{resultCount !== 1 ? "s" : ""}
          </p>

          {/* Sort */}
          <FilterSection label="Sort By">
            <select value={filters.sort} onChange={(e) => set("sort", e.target.value)} className="input text-sm min-h-[40px]">
              <option value="alpha">A → Z (Default)</option>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="qty_desc">Most Stock</option>
            </select>
              <option value="qty_desc">Most Stock</option>
            </select>
          </FilterSection>

          {/* Category */}
          <FilterSection label="Category">
            <select value={filters.category} onChange={(e) => set("category", e.target.value)} className="input text-sm min-h-[40px]">
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
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize ${
                    filters.condition === c
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
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
              className="input text-sm min-h-[40px]"
            />
          </FilterSection>

          {/* Price range */}
          <FilterSection label="Price Range ($)">
            <div className="flex gap-2">
              <input type="number" value={filters.minPrice}
                onChange={(e) => set("minPrice", e.target.value)}
                className="input text-sm min-h-[40px]" min={0} />
              <input type="number" value={filters.maxPrice}
                onChange={(e) => set("maxPrice", e.target.value)}
                className="input text-sm min-h-[40px]" min={0} />
            </div>
          </FilterSection>

          {/* Location */}
          <FilterSection label="Location / Origin">
            <input type="text" value={filters.location}
              onChange={(e) => set("location", e.target.value)}
              className="input text-sm min-h-[40px]" />
          </FilterSection>

          {/* Stock */}
          <FilterSection label="Min. Available Stock">
            <input type="number" value={filters.minQty}
              onChange={(e) => set("minQty", e.target.value)}
              className="input text-sm min-h-[40px]" min={1} />
          </FilterSection>

          {/* MOQ */}
          <FilterSection label="Max. Order Quantity">
            <input type="number" value={filters.minMoq}
              onChange={(e) => set("minMoq", e.target.value)}
              className="input text-sm min-h-[40px]" min={1} />
          </FilterSection>

          {/* Clear */}
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-red-500 hover:text-red-600 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
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
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
