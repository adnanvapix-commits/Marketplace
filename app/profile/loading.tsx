export default function ProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Profile card skeleton */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cream-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-cream-200 rounded w-40" />
            <div className="h-3 bg-cream-100 rounded w-56" />
            <div className="flex gap-2 mt-1">
              <div className="h-5 bg-cream-200 rounded-full w-16" />
              <div className="h-5 bg-cream-200 rounded-full w-20" />
            </div>
          </div>
          <div className="h-9 bg-cream-200 rounded-xl w-24 shrink-0" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-cream-100 rounded w-16" />
              <div className="h-4 bg-cream-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Listings skeleton */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 bg-cream-200 rounded w-28" />
          <div className="h-8 bg-cream-200 rounded-xl w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="h-4 bg-cream-200 rounded w-3/4" />
              <div className="h-5 bg-cream-100 rounded w-20" />
              <div className="flex gap-2">
                <div className="h-8 bg-cream-200 rounded-lg flex-1" />
                <div className="h-8 bg-cream-200 rounded-lg flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
