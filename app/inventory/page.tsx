import type { Metadata } from "next"
import { Suspense } from "react"
import { InventoryManagement } from "@/components/inventory/inventory-management"
import { InventoryPageSkeleton } from "@/components/inventory/inventory-page-skeleton"

export const metadata: Metadata = {
  title: "Inventory Management | CareSanar HMS",
  description: "Manage hospital inventory items, track stock levels, and monitor expiry dates.",
}

export default function InventoryPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage hospital inventory items, track stock levels, and monitor expiry dates.
        </p>
      </div>

      <Suspense fallback={<InventoryPageSkeleton />}>
        <InventoryManagement />
      </Suspense>
    </div>
  )
}

