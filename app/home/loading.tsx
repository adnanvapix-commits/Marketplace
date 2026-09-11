export default function HomeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 animate-pulse">
      {/* Search bar */}
      <div className="h-12 bg-cream-200 rounded-xl w-full mb-6" />
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="card p-4 h-64 bg-cream-50" />
        </div>
        {/* Product list */}
        <div className="flex-1 flex flex-col gap-2">
          {[1,2,3,4,5,6].map(i => (
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
    </div>
  );
}
