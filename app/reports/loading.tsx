import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex border-b space-x-6 pb-2">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-8 w-[120px]" />
          ))}
      </div>

      {/* Report cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-[150px]" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="h-[200px] w-full">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-9 w-[100px]" />
              </div>
            </div>
          ))}
      </div>

      {/* Report scheduler skeleton */}
      <div className="border rounded-lg p-6 mt-6">
        <Skeleton className="h-6 w-[200px] mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-9 w-[120px]" />
        </div>
      </div>
    </div>
  )
}

