import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function InventoryPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Search and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-full sm:w-40" />
        <Skeleton className="h-10 w-full sm:w-40" />
        <div className="flex-1 flex justify-end">
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-md">
        <div className="p-4 border-b">
          <div className="grid grid-cols-7 gap-4">
            {Array(7)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-6" />
              ))}
          </div>
        </div>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="p-4 border-b">
              <div className="grid grid-cols-7 gap-4">
                {Array(7)
                  .fill(0)
                  .map((_, j) => (
                    <Skeleton key={j} className="h-6" />
                  ))}
              </div>
            </div>
          ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-end space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

