"use client"

import { useState, useEffect } from "react"
import { AlertCircle, ArrowUpDown, Calendar, Edit, Eye, Plus, RefreshCw, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { AddInventoryItemDialog } from "./add-inventory-item-dialog"
import { EditInventoryItemDialog } from "./edit-inventory-item-dialog"
import { RestockItemDialog } from "./restock-item-dialog"
import { ViewItemDetailsDialog } from "./view-item-details-dialog"
import type { InventoryItem } from "@/types/inventory"
import { getMockInventoryItems } from "@/lib/mock-inventory";

export function InventoryManagement() {
  const { toast } = useToast()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortColumn, setSortColumn] = useState<keyof InventoryItem>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Summary statistics
  const totalItems = inventoryItems.length
  const lowStockItems = inventoryItems.filter((item) => item.quantity <= item.reorderLevel).length
  const expiringItems = inventoryItems.filter((item) => {
    if (!item.expiryDate) return false
    const expiryDate = new Date(item.expiryDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow && expiryDate >= today
  }).length

  // Load inventory data
  useEffect(() => {
    const items = getMockInventoryItems()
    setInventoryItems(items)
    setFilteredItems(items)
  }, [])

  // Filter and sort items
  useEffect(() => {
    let result = [...inventoryItems]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "low") {
        result = result.filter((item) => item.quantity <= item.reorderLevel)
      } else if (statusFilter === "expiring") {
        result = result.filter((item) => {
          if (!item.expiryDate) return false
          const expiryDate = new Date(item.expiryDate)
          const today = new Date()
          const thirtyDaysFromNow = new Date()
          thirtyDaysFromNow.setDate(today.getDate() + 30)
          return expiryDate <= thirtyDaysFromNow && expiryDate >= today
        })
      } else if (statusFilter === "ok") {
        result = result.filter(
          (item) =>
            item.quantity > item.reorderLevel &&
            (!item.expiryDate || new Date(item.expiryDate) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        )
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue === null || aValue === undefined) return sortDirection === "asc" ? -1 : 1
      if (bValue === null || bValue === undefined) return sortDirection === "asc" ? 1 : -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })

    setFilteredItems(result)
  }, [inventoryItems, searchQuery, categoryFilter, statusFilter, sortColumn, sortDirection])

  // Handle sorting
  const handleSort = (column: keyof InventoryItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Handle adding a new item
  const handleAddItem = (item: InventoryItem) => {
    setInventoryItems((prev) => [...prev, { ...item, id: `item-${prev.length + 1}` }])
    toast({
      title: "Item Added",
      description: `${item.name} has been added to inventory.`,
    })
    setAddDialogOpen(false)
  }

  // Handle editing an item
  const handleEditItem = (updatedItem: InventoryItem) => {
    setInventoryItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    toast({
      title: "Item Updated",
      description: `${updatedItem.name} has been updated.`,
    })
    setEditDialogOpen(false)
  }

  // Handle restocking an item
  const handleRestockItem = (itemId: string, quantity: number) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: item.quantity + quantity,
            lastRestocked: new Date().toISOString(),
          }
        }
        return item
      }),
    )
    const item = inventoryItems.find((item) => item.id === itemId)
    toast({
      title: "Item Restocked",
      description: `${item?.name} has been restocked with ${quantity} units.`,
    })
    setRestockDialogOpen(false)
  }

  // Get status badge for an item
  const getStatusBadge = (item: InventoryItem) => {
    // Check if item is expired
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Expired
        </Badge>
      )
    }

    // Check if item is expiring soon
    if (item.expiryDate) {
      const expiryDate = new Date(item.expiryDate)
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      if (expiryDate <= thirtyDaysFromNow && expiryDate >= today) {
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-500 text-white border-amber-600">
            <Calendar className="h-3 w-3" />
            Expiring Soon
          </Badge>
        )
      }
    }

    // Check if item is low in stock
    if (item.quantity <= item.reorderLevel) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Low Stock
        </Badge>
      )
    }

    // Item is OK
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
        In Stock
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Across all categories and locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below reorder level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{expiringItems}</div>
            <p className="text-xs text-muted-foreground">Items expiring within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Medication">Medication</SelectItem>
            <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Laboratory">Laboratory</SelectItem>
            <SelectItem value="Office Supplies">Office Supplies</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
            <SelectItem value="ok">In Stock</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 flex justify-end">
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 p-0 font-medium"
                >
                  Item Name
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("category")}
                  className="flex items-center gap-1 p-0 font-medium"
                >
                  Category
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("quantity")}
                  className="flex items-center gap-1 p-0 font-medium ml-auto"
                >
                  Quantity
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("reorderLevel")}
                  className="flex items-center gap-1 p-0 font-medium ml-auto"
                >
                  Reorder Level
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("expiryDate")}
                  className="flex items-center gap-1 p-0 font-medium"
                >
                  Expiry Date
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No inventory items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell
                    className={`text-right ${item.quantity <= item.reorderLevel ? "text-red-600 font-bold" : ""}`}
                  >
                    {item.quantity}
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{item.reorderLevel}</TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item)
                                setViewDetailsDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item)
                                setEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Item</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item)
                                setRestockDialogOpen(true)
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Restock</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <AddInventoryItemDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAdd={handleAddItem} />

      {selectedItem && (
        <>
          <EditInventoryItemDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
            onEdit={handleEditItem}
          />

          <RestockItemDialog
            open={restockDialogOpen}
            onOpenChange={setRestockDialogOpen}
            item={selectedItem}
            onRestock={handleRestockItem}
          />

          <ViewItemDetailsDialog
            open={viewDetailsDialogOpen}
            onOpenChange={setViewDetailsDialogOpen}
            item={selectedItem}
          />
        </>
      )}
    </div>
  )
}

