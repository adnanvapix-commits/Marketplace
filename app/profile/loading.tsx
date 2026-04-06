export default function ProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-pulse">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-200 rounded w-56" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="card h-28 bg-gray-100" />)}
      </div>
    </div>
  );
}
