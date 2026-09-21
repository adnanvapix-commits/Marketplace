export default function ChatWindowLoading() {
  return (
    <div className="flex flex-col min-h-screen md:h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full animate-pulse">
      {/* Header */}
      <div className="h-14 bg-white border-b flex items-center px-4 gap-3">
        <div className="w-8 h-8 bg-cream-200 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-cream-200 rounded w-32" />
          <div className="h-3 bg-cream-100 rounded w-48" />
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 bg-gray-50 p-4 space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
            <div className={`h-10 rounded-2xl ${i % 2 === 0 ? "bg-primary/20 w-48" : "bg-white border w-40"}`} />
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="h-16 bg-white border-t" />
    </div>
  );
}
