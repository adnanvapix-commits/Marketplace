"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface Country {
  name: string;
  code: string;   // ISO 3166-1 alpha-2
  dial: string;   // e.g. "+971"
  flag: string;   // emoji flag
}

// Top trading partner countries for a UAE B2B marketplace
// UAE is first and the default
export const COUNTRIES: Country[] = [
  { name: "UAE",          code: "AE", dial: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "SA", dial: "+966", flag: "🇸🇦" },
  { name: "Kuwait",       code: "KW", dial: "+965", flag: "🇰🇼" },
  { name: "Qatar",        code: "QA", dial: "+974", flag: "🇶🇦" },
  { name: "Bahrain",      code: "BH", dial: "+973", flag: "🇧🇭" },
  { name: "Oman",         code: "OM", dial: "+968", flag: "🇴🇲" },
  { name: "India",        code: "IN", dial: "+91",  flag: "🇮🇳" },
  { name: "Pakistan",     code: "PK", dial: "+92",  flag: "🇵🇰" },
  { name: "Egypt",        code: "EG", dial: "+20",  flag: "🇪🇬" },
  { name: "Turkey",       code: "TR", dial: "+90",  flag: "🇹🇷" },
  { name: "UK",           code: "GB", dial: "+44",  flag: "🇬🇧" },
  { name: "USA",          code: "US", dial: "+1",   flag: "🇺🇸" },
  { name: "China",        code: "CN", dial: "+86",  flag: "🇨🇳" },
  { name: "Germany",      code: "DE", dial: "+49",  flag: "🇩🇪" },
  { name: "France",       code: "FR", dial: "+33",  flag: "🇫🇷" },
  { name: "Jordan",       code: "JO", dial: "+962", flag: "🇯🇴" },
  { name: "Lebanon",      code: "LB", dial: "+961", flag: "🇱🇧" },
  { name: "Iraq",         code: "IQ", dial: "+964", flag: "🇮🇶" },
  { name: "Bangladesh",   code: "BD", dial: "+880", flag: "🇧🇩" },
  { name: "Sri Lanka",    code: "LK", dial: "+94",  flag: "🇱🇰" },
  { name: "Philippines",  code: "PH", dial: "+63",  flag: "🇵🇭" },
  { name: "Nigeria",      code: "NG", dial: "+234", flag: "🇳🇬" },
  { name: "South Africa", code: "ZA", dial: "+27",  flag: "🇿🇦" },
  { name: "Canada",       code: "CA", dial: "+1",   flag: "🇨🇦" },
  { name: "Australia",    code: "AU", dial: "+61",  flag: "🇦🇺" },
  { name: "Singapore",    code: "SG", dial: "+65",  flag: "🇸🇬" },
  { name: "Malaysia",     code: "MY", dial: "+60",  flag: "🇲🇾" },
  { name: "Indonesia",    code: "ID", dial: "+62",  flag: "🇮🇩" },
  { name: "Russia",       code: "RU", dial: "+7",   flag: "🇷🇺" },
  { name: "Ukraine",      code: "UA", dial: "+380", flag: "🇺🇦" },
];

/**
 * Parse a stored full number like "+971501234567" into dial code + local number.
 * Falls back to UAE (+971) if no match found.
 */
export function parseFullNumber(full: string): { country: Country; local: string } {
  const defaultCountry = COUNTRIES[0]; // UAE
  if (!full) return { country: defaultCountry, local: "" };

  // Sort by dial length descending so "+1868" matches before "+1"
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (full.startsWith(c.dial)) {
      return { country: c, local: full.slice(c.dial.length) };
    }
  }
  // No dial code prefix — treat entire value as local number
  return { country: defaultCountry, local: full };
}

interface Props {
  value: string;           // full number e.g. "+971501234567"
  onChange: (full: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export default function PhoneInput({
  value, onChange, placeholder = "501234567",
  required, label, error,
}: Props) {
  const { country: initialCountry, local: initialLocal } = parseFullNumber(value);
  const [selected, setSelected] = useState<Country>(initialCountry);
  const [local, setLocal] = useState(initialLocal);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip any leading zeros or accidental dial code re-entry
    const raw = e.target.value.replace(/[^\d\s\-()]/g, "");
    setLocal(raw);
    onChange(raw ? `${selected.dial}${raw}` : "");
  }

  function handleSelect(c: Country) {
    setSelected(c);
    setOpen(false);
    setSearch("");
    onChange(local ? `${c.dial}${local}` : "");
  }

  const filtered = search.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial.includes(search)
      )
    : COUNTRIES;

  return (
    <div>
      {label && (
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="flex gap-0">
        {/* Country code selector */}
        <div ref={dropRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 h-[44px] px-3 border border-r-0 border-cream-200 rounded-l-xl bg-cream-50 hover:bg-cream-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 min-w-[90px]"
          >
            <span className="text-lg leading-none">{selected.flag}</span>
            <span className="text-sm font-semibold text-gray-700">{selected.dial}</span>
            <ChevronDown size={13} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl border border-cream-200 shadow-lg z-50 overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-cream-100">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-cream-200 bg-cream-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
              {/* List */}
              <ul className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-gray-400 text-center">No results</li>
                ) : filtered.map(c => (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-cream-50 transition-colors text-left ${
                        selected.code === c.code ? "bg-primary/5 text-primary font-semibold" : "text-gray-700"
                      }`}
                    >
                      <span className="text-base w-6 text-center">{c.flag}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Number input */}
        <input
          type="tel"
          value={local}
          onChange={handleLocalChange}
          placeholder={placeholder}
          required={required}
          className="flex-1 min-h-[44px] px-4 text-sm border border-cream-200 rounded-r-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
          inputMode="tel"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
