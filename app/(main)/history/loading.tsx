export default function HistoryLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-24 bg-gray-200 rounded mb-4" />
      <div className="flex gap-2 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-32 bg-gray-200 rounded mb-3" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-40 bg-gray-100 rounded" />
                  </div>
                  <div className="h-5 w-14 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
