"use client"

import { useState } from "react"
import { AlertCircle, ArrowUpDown, Calendar, Edit, Eye, Plus, RefreshCw, Search, MoreVertical, Trash, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useInventory } from "@/hooks/use-inventory"
import { AddInventoryItemDialog } from "./add-inventory-item-dialog"
import { EditInventoryItemDialog } from "./edit-inventory-item-dialog"
import { RestockItemDialog } from "./restock-item-dialog"
import { ViewItemDetailsDialog } from "./view-item-details-dialog"
import type { InventoryItem } from "@/types/inventory"
import { 
  addInventoryItem,
  updateInventoryItem,
  restockInventoryItem,
  deleteInventoryItem
} from "@/app/inventory/actions"

export function InventoryManagement() {
  const { toast } = useToast()
  
  // Use our custom hook for inventory data
  const {
    // Data
    filteredItems,
    totalItems,
    totalPages,
    stats,
    
    // State
    isLoading,
    
    // Current values
    page,
    pageSize,
    searchQuery,
    categoryFilter,
    statusFilter,
    
    // Actions
    setSearchQuery,
    handlePageChange,
    handleSort,
    handleCategoryChange,
    handleStatusChange,
    handleServerSearch,
    refreshData
  } = useInventory()

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Handle search on Enter key
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleServerSearch()
    }
  }

  // Handle adding a new item
  const handleAddItem = async (item: Omit<InventoryItem, "id">) => {
    try {
      const response = await addInventoryItem(item)
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      // Refresh data
      refreshData()
      
      toast({
        title: "Item Added",
        description: `${item.name} has been added to inventory.`,
      })
      
      setAddDialogOpen(false)
    } catch (err) {
      console.error("Failed to add inventory item:", err)
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle updating an item
  const handleUpdateItem = async (item: InventoryItem) => {
    try {
      const response = await updateInventoryItem(item)
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      // Refresh data
      refreshData()
      
      toast({
        title: "Item Updated",
        description: `${item.name} has been updated.`,
      })
      
      setEditDialogOpen(false)
    } catch (err) {
      console.error("Failed to update inventory item:", err)
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle restocking an item
  const handleRestockItem = async (id: string, quantity: number) => {
    try {
      const response = await restockInventoryItem(id, quantity)
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      // Refresh data
      refreshData()
      
      toast({
        title: "Item Restocked",
        description: `Item has been restocked with ${quantity} units.`,
      })
      
      setRestockDialogOpen(false)
    } catch (err) {
      console.error("Failed to restock inventory item:", err)
      toast({
        title: "Error",
        description: "Failed to restock inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle deleting an item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete ${itemName}? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await deleteInventoryItem(itemId)
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      // Refresh data
      refreshData()
      
      toast({
        title: "Item Deleted",
        description: `${itemName} has been removed from inventory.`,
      })
    } catch (err) {
      console.error("Failed to delete inventory item:", err)
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get status badge for an item
  const getStatusBadge = (item: InventoryItem) => {
    // Expiry date check
    if (item.expiryDate) {
      const expiryDate = new Date(item.expiryDate)
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      
      if (expiryDate <= thirtyDaysFromNow && expiryDate >= today) {
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <Calendar className="mr-1 h-3 w-3" />
            Expiring Soon
          </Badge>
        )
      } else if (expiryDate < today) {
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        )
      }
    }
    
    // Quantity check
    if (item.quantity <= item.reorderLevel) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Low Stock
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className="bg-green-500 text-white hover:bg-green-600">
        In Stock
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringItems}</div>
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
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
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

        <Select value={statusFilter} onValueChange={handleStatusChange}>
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
          <Button onClick={() => setAddDialogOpen(true)} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                Item Name
                <ArrowUpDown className="inline ml-2 h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("category")} className="cursor-pointer">
                Category
                <ArrowUpDown className="inline ml-2 h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("quantity")} className="cursor-pointer">
                Quantity
                <ArrowUpDown className="inline ml-2 h-4 w-4" />
              </TableHead>
              <TableHead>Unit</TableHead>
              <TableHead onClick={() => handleSort("reorderLevel")} className="cursor-pointer">
                Reorder Level
                <ArrowUpDown className="inline ml-2 h-4 w-4" />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead onClick={() => handleSort("expiryDate")} className="cursor-pointer">
                Expiry Date
                <ArrowUpDown className="inline ml-2 h-4 w-4" />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No inventory items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className={item.quantity <= item.reorderLevel ? "text-red-600 font-medium" : ""}>
                    {item.quantity}
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.reorderLevel}</TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isLoading}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedItem(item)
                            setViewDetailsDialogOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedItem(item)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedItem(item)
                            setRestockDialogOpen(true)
                          }}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Restock
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-100"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredItems && filteredItems.length > 0 ? (page - 1) * pageSize + 1 : 0}-
          {Math.min(page * pageSize, totalItems)} of {totalItems} items
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <AddInventoryItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddItem}
      />

      {selectedItem && (
        <>
          <ViewItemDetailsDialog
            open={viewDetailsDialogOpen}
            onOpenChange={setViewDetailsDialogOpen}
            item={selectedItem}
          />

          <EditInventoryItemDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
            onEdit={handleUpdateItem}
          />

          <RestockItemDialog
            open={restockDialogOpen}
            onOpenChange={setRestockDialogOpen}
            item={selectedItem}
            onRestock={(quantity) => handleRestockItem(selectedItem.id, Number(quantity))}
          />
        </>
      )}
    </div>
  )
}

