

import { InventoryManagement } from "@/components/inventory/inventory-management"

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Track, manage, and order inventory items for the hospital.
        </p>
      </div>
      
        <InventoryManagement />
    </div>
  )
}

