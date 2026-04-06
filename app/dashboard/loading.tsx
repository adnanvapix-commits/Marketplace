export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-5 sm:py-8 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-48" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="card p-4 h-16 bg-gray-100" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="card h-24 bg-gray-100" />)}
      </div>
    </div>
  );
}
