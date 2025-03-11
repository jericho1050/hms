import { Skeleton } from "@/components/ui/skeleton"

export default function StaffLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex border-b space-x-6 pb-2">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[120px]" />
      </div>

      {/* Search and filter skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      {/* Staff directory skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-9 w-[80px]" />
                <Skeleton className="h-9 w-[80px]" />
              </div>
            </div>
          ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-[100px]" />
        <div className="flex gap-2">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-md" />
            ))}
        </div>
      </div>
    </div>
  )
}

