export default function SellLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 animate-pulse">
      <div className="max-w-2xl mx-auto">
        <div className="h-7 bg-cream-200 rounded w-36 mb-2" />
        <div className="h-4 bg-cream-100 rounded w-64 mb-6" />
        <div className="card p-5 sm:p-7 space-y-5">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-cream-100 rounded w-24" />
              <div className="h-11 bg-cream-100 rounded-xl w-full" />
            </div>
          ))}
          <div className="h-12 bg-cream-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
