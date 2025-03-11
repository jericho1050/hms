"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { InventoryItem } from "@/types/inventory"
import { formatCurrency } from "@/lib/utils"

interface ViewItemDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
}

export function ViewItemDetailsDialog({ open, onOpenChange, item }: ViewItemDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>SKU: {item.sku}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p>{item.category}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">
                {item.quantity <= item.reorderLevel ? (
                  <Badge variant="destructive">Low Stock</Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    In Stock
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Quantity</p>
              <p className={item.quantity <= item.reorderLevel ? "text-red-600 font-bold" : ""}>
                {item.quantity} {item.unit}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Reorder Level</p>
              <p>
                {item.reorderLevel} {item.unit}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p>{item.location || "Not specified"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
              <p>{item.expiryDate ? format(new Date(item.expiryDate), "PPP") : "N/A"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Supplier</p>
              <p>{item.supplier || "Not specified"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Cost</p>
              <p>{item.cost ? formatCurrency(item.cost) : "Not specified"}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="mt-1">{item.description || "No description available."}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Restocked</p>
            <p>{item.lastRestocked ? format(new Date(item.lastRestocked), "PPP") : "Unknown"}</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

