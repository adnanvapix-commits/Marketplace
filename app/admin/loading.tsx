export default function AdminLoading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8 space-y-6 animate-pulse">
      <div className="h-7 bg-cream-200 rounded w-32" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card p-4 h-20 bg-cream-50" />
        ))}
      </div>
      <div className="card p-5 h-16 bg-cream-50" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5 h-40 bg-cream-50" />
        <div className="card p-5 h-40 bg-cream-50" />
      </div>
    </div>
  );
}
