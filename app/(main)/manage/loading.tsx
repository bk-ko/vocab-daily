export default function ManageLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-7 w-24 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-32 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="h-14 bg-blue-100 rounded-2xl mb-3" />
      <div className="h-12 bg-gray-100 rounded-2xl mb-6" />
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-6 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
