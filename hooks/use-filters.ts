import { useState, useCallback } from 'react'

export function useFilters() {
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [doctorFilter, setDoctorFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState("")

  const resetFilters = useCallback(() => {
    setDepartmentFilter('all')
    setDoctorFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
  }, [])

  return {
    filters: {
      departmentFilter,
      doctorFilter,
      statusFilter,
      searchQuery
    },
    setters: {
      setDepartmentFilter,
      setDoctorFilter,
      setStatusFilter,
      setSearchQuery
    },
    resetFilters
  }
}