export default function SubscriptionLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-cream-200 rounded w-44 mb-2" />
      <div className="h-4 bg-cream-100 rounded w-64 mb-8" />

      {/* Status card */}
      <div className="card p-6 mb-8 h-28 bg-cream-50" />

      {/* Plan cards */}
      <div className="h-5 bg-cream-200 rounded w-36 mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 h-72 bg-cream-50" />
        ))}
      </div>

      {/* Details */}
      <div className="card p-6 h-64 bg-cream-50" />
    </div>
  );
}
