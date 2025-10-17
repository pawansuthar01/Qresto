const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Skeleton Header */}
      <div className="sticky top-0 z-10 h-[72px] bg-gray-200 shadow-md">
        <div className="container mx-auto h-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-300"></div>
            <div>
              <div className="h-5 w-32 rounded bg-gray-300"></div>
              <div className="h-4 w-20 rounded bg-gray-300 mt-1"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Category Tabs */}
      <div className="sticky top-[72px] z-10 border-b bg-white">
        <div className="container mx-auto flex gap-2 p-4 overflow-x-auto">
          <div className="h-9 w-24 rounded-lg bg-gray-200"></div>
          <div className="h-9 w-28 rounded-lg bg-gray-200"></div>
          <div className="h-9 w-20 rounded-lg bg-gray-200"></div>
          <div className="h-9 w-32 rounded-lg bg-gray-200"></div>
        </div>
      </div>

      {/* Skeleton Menu Items Grid */}
      <div className="container mx-auto py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-white p-4 shadow">
            <div className="h-48 w-full rounded-lg bg-gray-200"></div>
            <div className="mt-4 h-5 w-3/4 rounded bg-gray-200"></div>
            <div className="mt-2 h-4 w-full rounded bg-gray-200"></div>
            <div className="mt-1 h-4 w-5/6 rounded bg-gray-200"></div>
            <div className="mt-4 h-10 w-full rounded-lg bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
