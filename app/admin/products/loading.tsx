export default function ProductsLoading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8 animate-pulse">
      <div className="h-7 bg-cream-200 rounded w-44 mb-6" />
      <div className="card p-4 h-12 bg-cream-50 mb-4" />
      <div className="card overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-cream-100 bg-white px-4 flex items-center gap-4">
            <div className="h-3 bg-cream-200 rounded w-48" />
            <div className="h-3 bg-cream-100 rounded w-20" />
            <div className="h-3 bg-cream-100 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
