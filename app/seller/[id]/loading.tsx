export default function SellerLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="card p-6 mb-6">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full bg-cream-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-cream-200 rounded w-40" />
            <div className="h-3 bg-cream-100 rounded w-56" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {[1,2,3].map(i => (
          <div key={i} className="card h-20 flex gap-0 overflow-hidden">
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
