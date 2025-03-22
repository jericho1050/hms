import { InventoryItem } from '@/types/inventory'

export const mockInventoryItems: InventoryItem[] = [
  { 
    id: '1', 
    name: 'Paracetamol', 
    sku: 'MED-001', 
    category: 'Medications', 
    description: 'Pain reliever and fever reducer', 
    quantity: 150, 
    unit: 'Tablets',
    reorderLevel: 30,
    location: 'Pharmacy Shelf A2',
    expiryDate: '2024-12-31',
    supplier: 'MedSupply Inc.',
    cost: 0.15,
    lastRestocked: '2023-11-15'
  },
  { 
    id: '2', 
    name: 'Gauze Bandages', 
    sku: 'SUPP-002', 
    category: 'Supplies', 
    description: 'Sterile cotton bandages', 
    quantity: 75, 
    unit: 'Rolls',
    reorderLevel: 25,
    location: 'Supply Room B1',
    expiryDate: '2025-06-20',
    supplier: 'Medical Supplies Ltd.',
    cost: 1.25,
    lastRestocked: '2023-12-01'
  },
  { 
    id: '3', 
    name: 'Surgical Gloves', 
    sku: 'SUPP-003', 
    category: 'Supplies', 
    description: 'Latex-free surgical gloves', 
    quantity: 20, 
    unit: 'Boxes',
    reorderLevel: 30,
    location: 'Supply Room A3',
    expiryDate: '2024-09-15',
    supplier: 'GloveWorx',
    cost: 8.99,
    lastRestocked: '2023-10-15'
  },
  { 
    id: '4', 
    name: 'Insulin', 
    sku: 'MED-004', 
    category: 'Medications', 
    description: 'Regular insulin 10ml vials', 
    quantity: 10, 
    unit: 'Vials',
    reorderLevel: 15,
    location: 'Refrigerated Storage C1',
    expiryDate: '2024-05-15',
    supplier: 'PharmaCorp',
    cost: 27.50,
    lastRestocked: '2024-01-10'
  },
  { 
    id: '5', 
    name: 'Syringes', 
    sku: 'SUPP-005', 
    category: 'Supplies', 
    description: 'Disposable syringes 5ml', 
    quantity: 200, 
    unit: 'Pieces',
    reorderLevel: 50,
    location: 'Supply Room B2',
    expiryDate: null,
    supplier: 'MedTech Solutions',
    cost: 0.22,
    lastRestocked: '2024-02-01'
  }
]

export const mockInventoryStats = {
  totalItems: 5,
  lowStockItems: 1,
  expiringItems: 2
}

export const mockAddItemPayload = {
  name: 'New Test Item',
  sku: 'TEST-001',
  category: 'Test Category',
  description: 'Test description',
  quantity: 25,
  unit: 'Pieces',
  reorderLevel: 10,
  location: 'Test Location',
  expiryDate: '2025-01-01',
  supplier: 'Test Supplier',
  cost: 9.99
}

export const mockUpdateItemPayload = {
  id: '1',
  name: 'Updated Item Name',
  sku: 'MED-001-UPDATED',
  category: 'Medications',
  description: 'Updated description',
  quantity: 150, 
  unit: 'Tablets',
  reorderLevel: 40,
  location: 'Pharmacy Shelf A3',
  expiryDate: '2024-12-31',
  supplier: 'MedSupply Inc.',
  cost: 0.20,
  lastRestocked: '2023-11-15'
}

export const mockRestockData = {
  itemId: '3',
  quantity: 15,
  previousQuantity: 20,
  newQuantity: 35
}

export const mockSuccessResponse = {
  success: true
}

export const mockErrorResponse = {
  success: false,
  error: 'An error occurred'
}

export const mockSupabaseInventoryResponse = {
  data: mockInventoryItems,
  error: null
} 