import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { InventoryItem } from "@/types/inventory"
import { supabase } from "@/utils/supabase/client"
import { mapDbItemToInventoryItem } from "@/app/inventory/utils"

interface InventoryStats {
  totalItems: number
  lowStockItems: number
  expiringItems: number
}

interface InventoryFilters {
  category?: string
  status?: string
  search?: string
}

interface InventoryData {
  items: InventoryItem[]
  totalItems: number
  totalPages: number
}

export function useInventory() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // State for inventory data
  const [data, setData] = useState<InventoryData>({
    items: [],
    totalItems: 0,
    totalPages: 1
  })
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    lowStockItems: 0,
    expiringItems: 0
  })
  
  // Filter and pagination state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Client-side search for immediate feedback
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  
  // Extract current params values
  const page = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 10
  const sortColumn = searchParams.get('sort') || 'item_name'
  const sortDirection = searchParams.get('order') as 'asc' | 'desc' || 'asc'
  const categoryFilter = searchParams.get('category') || 'all'
  const statusFilter = searchParams.get('status') || 'all'
  const serverSearchQuery = searchParams.get('search') || ''

  // Function to convert client-side column name to server column name
  const getServerColumnName = (column: keyof InventoryItem): string => {
    const columnMap: Record<keyof InventoryItem, string> = {
      id: 'id',
      name: 'item_name',
      sku: 'sku',
      category: 'category',
      description: 'description',
      quantity: 'quantity',
      unit: 'unit',
      reorderLevel: 'reorder_level',
      location: 'location',
      expiryDate: 'expiry_date',
      supplier: 'supplier',
      cost: 'cost_per_unit',
      lastRestocked: 'last_restocked'
    }
    
    return columnMap[column] || 'item_name'
  }

  // Function to create URL with updated search params
  const createQueryString = useCallback((params: Record<string, string | number>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    // Set the new params
    Object.entries(params).forEach(([name, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newSearchParams.set(name, String(value))
      } else {
        newSearchParams.delete(name)
      }
    })
    
    return newSearchParams.toString()
  }, [searchParams])

  // Function to fetch inventory data directly from Supabase
  const fetchInventory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Start building the query
      let query = supabase
        .from('inventory')
        .select('*')
      
      // Apply filters
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }
      
      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'low':
            // For low stock items, we'll filter client-side after fetching
            break
          case 'expiring':
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
            query = query
              .gte('expiry_date', new Date().toISOString().split('T')[0])
              .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
            break
          case 'ok':
            // Get in-stock items
            query = query.gt('quantity', 0)
            break
        }
      }
      
      // Apply search
      if (serverSearchQuery) {
        query = query.or(
          `item_name.ilike.%${serverSearchQuery}%,sku.ilike.%${serverSearchQuery}%,category.ilike.%${serverSearchQuery}%`
        )
      }
      
      // Execute the query to get all results first
      const { data: allItems, error: itemsError } = await query
      
      if (itemsError) {
        throw itemsError
      }
      
      // Apply low stock filter if needed (client-side)
      let filteredItems = allItems || []
      if (statusFilter === 'low') {
        filteredItems = filteredItems.filter(item => 
          item.quantity <= (item.reorder_level || 0)
        )
      }
      
      // Calculate total counts after all filters
      const totalCount = filteredItems.length
      const totalPages = Math.ceil(totalCount / pageSize)
      
      // Apply sorting and pagination (client-side since we already have the data)
      let sortedItems = [...filteredItems]
      
      // Sort items
      sortedItems.sort((a, b) => {
        const aValue = a[sortColumn as keyof typeof a]
        const bValue = b[sortColumn as keyof typeof b]
        
        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
        
        // For numbers and other types
        return sortDirection === 'asc' 
          ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
          : (bValue < aValue ? -1 : bValue > aValue ? 1 : 0)
      })
      
      // Paginate
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedItems = sortedItems.slice(startIndex, endIndex)
      
      // Transform data to match our InventoryItem type
      const transformedItems = paginatedItems.map(mapDbItemToInventoryItem)
      
      // Update state with fetched data
      setData({
        items: transformedItems,
        totalItems: totalCount,
        totalPages: totalPages || 1
      })
      
      // Set filtered items initially to the same as items
      setFilteredItems(transformedItems)
      
      // Fetch stats in a separate query
      await fetchInventoryStats()
    } catch (error) {
      console.error('Error fetching inventory data:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, sortColumn, sortDirection, categoryFilter, statusFilter, serverSearchQuery])

  // Function to fetch inventory stats directly from Supabase
  const fetchInventoryStats = async () => {
    try {
      // Get all items to calculate stats
      const { data: items, error: itemsError } = await supabase
        .from('inventory')
        .select('*')
      
      if (itemsError) throw itemsError
      
      if (!items) {
        setStats({
          totalItems: 0,
          lowStockItems: 0,
          expiringItems: 0
        })
        return
      }
      
      const totalItems = items.length
      
      // Calculate low stock items
      const lowStockItems = items.filter(item => 
        item.quantity <= (item.reorder_level || 0)
      ).length
      
      // Calculate expiring items
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      
      const expiringItems = items.filter(item => {
        if (!item.expiry_date) return false
        const expiryDate = new Date(item.expiry_date)
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow
      }).length
      
      setStats({
        totalItems,
        lowStockItems,
        expiringItems
      })
    } catch (error) {
      console.error('Error fetching inventory stats:', error)
      // We don't want to fail the whole operation if just stats fail
      setStats({
        totalItems: 0,
        lowStockItems: 0,
        expiringItems: 0
      })
    }
  }

  // Fetch data when URL parameters change
  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  // Apply client-side search filter for responsiveness
  useEffect(() => {
    if (!data.items.length) {
      setFilteredItems([])
      return
    }
    
    let result = [...data.items]

    // Apply search filter for immediate feedback
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.sku && item.sku.toLowerCase().includes(query))
      )
    }

    setFilteredItems(result)
  }, [data.items, searchQuery])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    // Don't do anything if requesting a page outside valid range
    if (newPage < 1 || newPage > data.totalPages) return
    
    // Update URL and fetch new data through navigation
    const query = createQueryString({ 
      page: newPage, 
      pageSize, 
      sort: sortColumn, 
      order: sortDirection 
    })
    router.push(`${pathname}?${query}`)
  }

  // Handle sorting
  const handleSort = (column: keyof InventoryItem) => {
    const serverColumn = getServerColumnName(column)
    const newSortDirection = sortColumn === serverColumn && sortDirection === "asc" ? "desc" : "asc"
    
    // Update URL and fetch new data through navigation
    const query = createQueryString({ 
      page, 
      pageSize, 
      sort: serverColumn, 
      order: newSortDirection 
    })
    router.push(`${pathname}?${query}`)
  }

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    // Update URL and fetch new data
    const query = createQueryString({ 
      page: 1, // Reset to first page
      pageSize, 
      sort: sortColumn, 
      order: sortDirection,
      category: category === 'all' ? '' : category
    })
    router.push(`${pathname}?${query}`)
  }

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    // Update URL and fetch new data
    const query = createQueryString({ 
      page: 1, // Reset to first page
      pageSize, 
      sort: sortColumn, 
      order: sortDirection,
      status: status === 'all' ? '' : status
    })
    router.push(`${pathname}?${query}`)
  }

  // Handle server-side search 
  const handleServerSearch = () => {
    // Update URL and fetch new data
    const query = createQueryString({ 
      page: 1, // Reset to first page
      pageSize, 
      sort: sortColumn, 
      order: sortDirection,
      search: searchQuery
    })
    router.push(`${pathname}?${query}`)
  }

  return {
    // Data
    inventoryItems: data.items,
    filteredItems,
    totalItems: data.totalItems,
    totalPages: data.totalPages,
    stats,
    
    // State
    isLoading,
    error,
    
    // Current values
    page,
    pageSize,
    sortColumn,
    sortDirection,
    categoryFilter,
    statusFilter,
    searchQuery,
    
    // Actions
    setSearchQuery,
    handlePageChange,
    handleSort,
    handleCategoryChange,
    handleStatusChange,
    handleServerSearch,
    refreshData: fetchInventory
  }
}