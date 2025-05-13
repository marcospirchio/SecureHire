export default function Loading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="w-64 h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
