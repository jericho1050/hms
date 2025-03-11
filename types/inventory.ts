export type InventoryCategory = "Medication" | "Medical Supplies" | "Equipment" | "Laboratory" | "Office Supplies"

export interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  description?: string
  quantity: number
  unit: string
  reorderLevel: number
  location?: string
  expiryDate?: string
  supplier?: string
  cost?: number
  lastRestocked?: string
}

