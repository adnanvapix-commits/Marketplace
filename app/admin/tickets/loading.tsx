export default function TicketsLoading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8 animate-pulse">
      <div className="h-7 bg-cream-200 rounded w-40 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[1,2,3,4].map(i => <div key={i} className="card h-16 bg-cream-50" />)}
      </div>
      <div className="card p-4 h-12 bg-cream-50 mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 h-16 bg-cream-50" />
        ))}
      </div>
    </div>
  );
}
