export default function NotificationsLoading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8 animate-pulse">
      <div className="h-7 bg-cream-200 rounded w-48 mb-2" />
      <div className="h-4 bg-cream-100 rounded w-64 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 h-96 bg-cream-50" />
        <div className="card p-5 h-96 bg-cream-50" />
      </div>
    </div>
  );
}
