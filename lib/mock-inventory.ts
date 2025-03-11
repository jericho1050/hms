import type { InventoryItem } from "@/types/inventory"

export function getMockInventoryItems(): InventoryItem[] {
  return [
    {
      id: "item-1",
      name: "Acetaminophen 500mg",
      sku: "MED-ACT-500",
      category: "Medication",
      description: "Pain reliever and fever reducer",
      quantity: 250,
      unit: "tablets",
      reorderLevel: 50,
      location: "Pharmacy Storage A",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      supplier: "MedPharm Supplies",
      cost: 0.15,
      lastRestocked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    },
    {
      id: "item-2",
      name: "Disposable Surgical Masks",
      sku: "SUP-MASK-001",
      category: "Medical Supplies",
      description: "3-ply disposable face masks for medical use",
      quantity: 1200,
      unit: "pieces",
      reorderLevel: 500,
      location: "Supply Room B",
      expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years from now
      supplier: "SafetyFirst Medical",
      cost: 0.25,
      lastRestocked: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    },
    {
      id: "item-3",
      name: "Nitrile Examination Gloves (Medium)",
      sku: "SUP-GLOVE-M",
      category: "Medical Supplies",
      description: "Powder-free nitrile examination gloves, size medium",
      quantity: 35,
      unit: "boxes",
      reorderLevel: 40,
      location: "Supply Room A",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      supplier: "MedEquip Solutions",
      cost: 8.5,
      lastRestocked: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    },
    {
      id: "item-4",
      name: "Digital Thermometer",
      sku: "EQP-THERM-001",
      category: "Equipment",
      description: "Digital thermometer for oral, rectal, or axillary temperature measurement",
      quantity: 75,
      unit: "pieces",
      reorderLevel: 20,
      location: "Equipment Storage",
      expiryDate: undefined, // No expiry
      supplier: "MedTech Devices",
      cost: 12.99,
      lastRestocked: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    },
    {
      id: "item-5",
      name: "Amoxicillin 250mg",
      sku: "MED-AMOX-250",
      category: "Medication",
      description: "Antibiotic medication for bacterial infections",
      quantity: 120,
      unit: "capsules",
      reorderLevel: 30,
      location: "Pharmacy Storage B",
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now (expiring soon)
      supplier: "MedPharm Supplies",
      cost: 0.35,
      lastRestocked: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    },
    {
      id: "item-6",
      name: "Blood Collection Tubes",
      sku: "LAB-BCT-001",
      category: "Laboratory",
      description: "Vacuum blood collection tubes with EDTA",
      quantity: 500,
      unit: "tubes",
      reorderLevel: 100,
      location: "Laboratory Storage",
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
      supplier: "LabSupplies Inc.",
      cost: 0.45,
      lastRestocked: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    },
    {
      id: "item-7",
      name: "Printer Paper",
      sku: "OFF-PAPER-A4",
      category: "Office Supplies",
      description: "A4 size printer paper, 80gsm",
      quantity: 25,
      unit: "reams",
      reorderLevel: 10,
      location: "Admin Office Storage",
      expiryDate: undefined, // No expiry
      supplier: "Office Depot",
      cost: 4.99,
      lastRestocked: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
    },
    {
      id: "item-8",
      name: "Insulin Syringes",
      sku: "SUP-SYR-INS",
      category: "Medical Supplies",
      description: "1ml insulin syringes with 30G needle",
      quantity: 15,
      unit: "boxes",
      reorderLevel: 20,
      location: "Supply Room C",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      supplier: "MedEquip Solutions",
      cost: 15.75,
      lastRestocked: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), // 50 days ago
    },
    {
      id: "item-9",
      name: "Pulse Oximeter",
      sku: "EQP-OXIM-001",
      category: "Equipment",
      description: "Fingertip pulse oximeter for SpO2 and pulse rate measurement",
      quantity: 30,
      unit: "pieces",
      reorderLevel: 10,
      location: "Equipment Storage",
      expiryDate: undefined, // No expiry
      supplier: "MedTech Devices",
      cost: 24.99,
      lastRestocked: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), // 75 days ago
    },
    {
      id: "item-10",
      name: "Ibuprofen 200mg",
      sku: "MED-IBU-200",
      category: "Medication",
      description: "Non-steroidal anti-inflammatory drug (NSAID)",
      quantity: 300,
      unit: "tablets",
      reorderLevel: 60,
      location: "Pharmacy Storage A",
      expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now (expiring soon)
      supplier: "MedPharm Supplies",
      cost: 0.1,
      lastRestocked: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days ago
    },
  ]
}

