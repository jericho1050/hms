
import type { InventoryItem } from '@/types/inventory'
import type { Tables } from '@/types/supabase'

// Helper function to convert from Supabase inventory to our InventoryItem format
export function mapDbItemToInventoryItem(dbItem: Tables<'inventory'>): InventoryItem {
  return {
    id: dbItem.id,
    name: dbItem.item_name,
    sku: dbItem.sku || dbItem.id.slice(0, 8), // Generate a SKU from the ID if none exists
    category: dbItem.category,
    description: dbItem.description || '', 
    quantity: dbItem.quantity,
    unit: dbItem.unit || '',
    reorderLevel: dbItem.reorder_level || 0,
    location: dbItem.location || '',
    expiryDate: dbItem.expiry_date ? new Date(dbItem.expiry_date).toISOString() : undefined,
    supplier: dbItem.supplier || '',
    cost: dbItem.cost_per_unit ?? undefined,
    lastRestocked: dbItem.last_restocked || dbItem.updated_at,
  }
}

