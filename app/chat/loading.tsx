export default function ChatLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-32 mb-6" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
