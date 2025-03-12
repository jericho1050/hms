import { useState, useCallback } from 'react'

type SortDirection = 'asc' | 'desc'

export function useSorting<T>(defaultColumn: keyof T) {
  const [sortColumn, setSortColumn] = useState<keyof T>(defaultColumn)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = useCallback((column: keyof T) => {
    setSortColumn(currentColumn => {
      setSortDirection(currentDirection => {
        if (currentColumn === column) {
          return currentDirection === 'asc' ? 'desc' : 'asc'
        }
        return 'asc'
      })
      return column
    })
  }, [])

  const sortData = useCallback((data: T[]) => {
    return [...data].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue === bValue) return 0
      
      const comparison = aValue < bValue ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [sortColumn, sortDirection])

  return {
    sortColumn,
    sortDirection,
    handleSort,
    sortData
  }
}