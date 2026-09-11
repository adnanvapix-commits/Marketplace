export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-5 sm:py-8 animate-pulse">

      {/* Profile header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cream-200 shrink-0" />
        <div className="space-y-2">
          <div className="h-5 bg-cream-200 rounded w-36" />
          <div className="h-3 bg-cream-100 rounded w-52" />
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-3 sm:p-4 space-y-2">
            <div className="h-3 bg-cream-100 rounded w-20" />
            <div className="h-5 bg-cream-200 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-8">
        <div className="h-10 bg-cream-200 rounded-xl flex-1 sm:flex-none sm:w-32" />
        <div className="h-10 bg-cream-100 rounded-xl flex-1 sm:flex-none sm:w-32" />
        <div className="h-10 bg-cream-100 rounded-xl flex-1 sm:flex-none sm:w-28" />
      </div>

      {/* Listings header */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 bg-cream-200 rounded w-24" />
        <div className="h-4 bg-cream-100 rounded w-16" />
      </div>

      {/* Listing cards */}
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card flex gap-0 overflow-hidden h-20">
            <div className="w-20 bg-cream-200 shrink-0" />
            <div className="flex-1 p-3 space-y-2">
              <div className="h-4 bg-cream-200 rounded w-3/4" />
              <div className="h-3 bg-cream-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
