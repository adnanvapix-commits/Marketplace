export default function WishlistLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-7 bg-cream-200 rounded w-40 mb-6" />
      <div className="flex flex-col gap-2">
        {[1,2,3].map(i => (
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
