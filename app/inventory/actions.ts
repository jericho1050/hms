'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { InventoryItem } from '@/types/inventory'

// Helper function to convert from our InventoryItem to Supabase format
function mapInventoryItemToDb(item: Partial<InventoryItem>) {
  return {
    item_name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    reorder_level: item.reorderLevel,
    location: item.location,
    expiry_date: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : null,
    supplier: item.supplier,
    cost_per_unit: item.cost,
    status: item.quantity && item.reorderLevel && item.quantity <= item.reorderLevel ? 'low' : 'in-stock',
  }
}

// Add a new inventory item
export async function addInventoryItem(item: Omit<InventoryItem, 'id'>) {
  try {
    const supabase = await createClient()
    const dbItem = mapInventoryItemToDb(item)
    
    const { data, error } = await supabase
      .from('inventory')
      .insert(dbItem)
      .select()
      .single()
    
    if (error) {
      console.error('Error adding inventory item:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/inventory')
    return { success: true, data }
  } catch (error) {
    console.error('Exception adding inventory item:', error)
    return { success: false, error: 'Failed to add inventory item' }
  }
}

// Update an existing inventory item
export async function updateInventoryItem(item: InventoryItem) {
  try {
    const supabase = await createClient()
    const dbItem = mapInventoryItemToDb(item)
    
    const { data, error } = await supabase
      .from('inventory')
      .update(dbItem)
      .eq('id', item.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating inventory item:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/inventory')
    return { success: true, data }
  } catch (error) {
    console.error('Exception updating inventory item:', error)
    return { success: false, error: 'Failed to update inventory item' }
  }
}

// Delete an inventory item
export async function deleteInventoryItem(id: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting inventory item:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/inventory')
    return { success: true }
  } catch (error) {
    console.error('Exception deleting inventory item:', error)
    return { success: false, error: 'Failed to delete inventory item' }
  }
}

// Restock an inventory item
export async function restockInventoryItem(id: string, quantity: number) {
  try {
    const supabase = await createClient()
    
    // First get the current item
    const { data: currentItem, error: fetchError } = await supabase
      .from('inventory')
      .select()
      .eq('id', id)
      .single()
    
    if (fetchError) {
      console.error('Error fetching inventory item for restock:', fetchError)
      return { success: false, error: fetchError.message }
    }
    
    // Update the quantity
    const newQuantity = currentItem.quantity + quantity
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        quantity: newQuantity,
        status: newQuantity <= (currentItem.reorder_level || 0) ? 'low' : 'in-stock',
        updated_at: new Date().toISOString() // Update the timestamp for last restocked
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error restocking inventory item:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/inventory')
    return { success: true, data }
  } catch (error) {
    console.error('Exception restocking inventory item:', error)
    return { success: false, error: 'Failed to restock inventory item' }
  }
} 