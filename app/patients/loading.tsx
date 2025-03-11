import { Skeleton } from "@/components/ui/skeleton"

export default function PatientsLoading() {
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

      {/* Search and filter skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="bg-muted p-4 grid grid-cols-6 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
        </div>

        {/* Table rows */}
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border-t p-4 grid grid-cols-6 gap-4">
              {Array(6)
                .fill(0)
                .map((_, j) => (
                  <Skeleton key={j} className="h-5 w-full" />
                ))}
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

