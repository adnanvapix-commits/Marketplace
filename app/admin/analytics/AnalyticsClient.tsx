"use client";

import { Eye, Users, Package, Crown, Star, Award } from "lucide-react";

interface Props {
  signupChart: { date: string; count: number; label: string }[];
  subStats: { active: number; expired: number; inactive: number };
  tiers: Record<string, number>;
  topProducts: { id: string; title: string; view_count: number; category: string }[];
  totalProducts: number;
  totalUsers: number;
}

export default function AnalyticsClient({ signupChart, subStats, tiers, topProducts, totalProducts, totalUsers }: Props) {
  const maxSignups = Math.max(...signupChart.map(d => d.count), 1);
  const totalSignups30d = signupChart.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-6">

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "New Users (30d)", value: totalSignups30d, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Total Users",     value: totalUsers,     icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Total Products",  value: totalProducts,  icon: Package, color: "text-green-600 bg-green-50" },
          { label: "Active Subs",     value: subStats.active, icon: Crown, color: "text-amber-600 bg-amber-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Signups chart */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-800 text-sm mb-4">New Signups — Last 30 Days</h2>
        <div className="flex items-end gap-1 h-32">
          {signupChart.map((d, i) => {
            const height = maxSignups > 0 ? Math.max(4, (d.count / maxSignups) * 100) : 4;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {d.count > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d.count} on {d.label}
                  </div>
                )}
                <div
                  className="w-full rounded-t-sm transition-all bg-primary/70 hover:bg-primary"
                  style={{ height: `${height}%` }}
                />
                {(i === 0 || i === 14 || i === 29) && (
                  <span className="text-[9px] text-gray-400 rotate-0 whitespace-nowrap">{d.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Subscription breakdown */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 text-sm mb-4">Subscription Status</h2>
          <div className="space-y-3">
            {[
              { label: "Active",   value: subStats.active,   cls: "bg-green-500" },
              { label: "Expired",  value: subStats.expired,  cls: "bg-orange-500" },
              { label: "None",     value: subStats.inactive, cls: "bg-gray-300" },
            ].map(({ label, value, cls }) => {
              const total = subStats.active + subStats.expired + subStats.inactive || 1;
              const pct = Math.round((value / total) * 100);
              return (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{label}</span>
                    <span className="text-gray-500">{value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cls}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tier breakdown */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 text-sm mb-4">Subscription Tiers</h2>
          <div className="space-y-3">
            {[
              { tier: "elite",    label: "Elite",    icon: Crown, cls: "bg-amber-400",  text: "text-amber-700" },
              { tier: "expert",   label: "Expert",   icon: Star,  cls: "bg-slate-400",  text: "text-slate-600" },
              { tier: "beginner", label: "Beginner", icon: Award, cls: "bg-orange-400", text: "text-orange-700" },
            ].map(({ tier, label, icon: Icon, cls, text }) => {
              const value = tiers[tier] ?? 0;
              const total = Object.values(tiers).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((value / total) * 100);
              return (
                <div key={tier} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold ${text}`}>{label}</span>
                      <span className="text-gray-500">{value}</span>
                    </div>
                    <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cls}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top products by views */}
      {topProducts.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <Eye size={15} className="text-primary" /> Most Viewed Products
          </h2>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-cream-100 last:border-0">
                <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                  <Eye size={11} /> {(p.view_count ?? 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
