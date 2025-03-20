import { Suspense } from "react"
import { RoomsManagement } from "@/components/rooms/rooms-management"
import { RoomsPageSkeleton } from "@/components/rooms/rooms-page-skeleton"
import { getRoomsData,getDepartmentsData } from "./utilts"

export const metadata = {
  title: "Room Management | CareSanar HMS",
  description: "Manage hospital rooms and bed assignments",
}

export default async function RoomsPage() {
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage room availability and bed assignments across all departments
        </p>
      </div>

      <Suspense fallback={<RoomsPageSkeleton />}>
        <RoomsManagement />
      </Suspense>
    </div>
  )
}

