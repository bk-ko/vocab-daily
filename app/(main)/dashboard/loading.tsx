export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5">
        <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-7 w-36 bg-gray-200 rounded" />
      </div>
      <div className="bg-gray-200 rounded-full h-2 mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="h-7 w-28 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-48 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
