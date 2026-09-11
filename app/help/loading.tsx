export default function HelpLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-cream-200 mx-auto mb-4" />
        <div className="h-7 bg-cream-200 rounded w-48 mx-auto mb-2" />
        <div className="h-4 bg-cream-100 rounded w-72 mx-auto" />
      </div>
      <div className="flex gap-1 bg-cream-100 rounded-xl p-1 mb-6">
        {[1,2,3].map(i => <div key={i} className="flex-1 h-9 bg-cream-200 rounded-lg" />)}
      </div>
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="card h-16 bg-cream-50" />)}
      </div>
    </div>
  );
}
