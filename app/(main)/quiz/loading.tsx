export default function QuizLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-6 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>
      <div className="bg-gray-200 rounded-full h-2 mb-6" />
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="h-3 w-12 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-48 bg-gray-200 rounded mb-3" />
        <div className="h-10 w-40 bg-gray-200 rounded mb-8" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
