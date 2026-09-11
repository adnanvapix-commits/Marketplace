export default function AccountLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-pulse">
      <div className="h-7 bg-cream-200 rounded w-40 mb-6" />
      <div className="card p-6 space-y-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 bg-cream-100 rounded w-24" />
            <div className="h-11 bg-cream-100 rounded-xl w-full" />
          </div>
        ))}
        <div className="h-12 bg-cream-200 rounded-xl w-full" />
      </div>
    </div>
  );
}
