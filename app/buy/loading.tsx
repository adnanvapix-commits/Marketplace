export default function BuyLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-lg mb-6 max-w-2xl" />
      <div className="flex gap-6">
        <div className="w-64 shrink-0 h-80 bg-gray-200 rounded-xl" />
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-gray-200">
              <div className="aspect-[4/3]" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="h-3 bg-gray-300 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
