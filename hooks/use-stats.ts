import { useState, useCallback } from "react"
import { supabase } from "@/utils/supabase/client"

export interface StatsState {
  patientCount: number
  appointmentsToday: number
  staffCount: number
  revenueThisMonth: number
  bedOccupancy: number
  inventoryItems: number
  medicalRecordsCount: number
  billingCount: number
  departmentsCount: number
  roomsTotal: number
  roomsAvailable: number
}

export function useStatsData() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsState>({
    patientCount: 0,
    appointmentsToday: 0,
    staffCount: 0,
    revenueThisMonth: 0,
    bedOccupancy: 0,
    inventoryItems: 0,
    medicalRecordsCount: 0,
    billingCount: 0,
    departmentsCount: 0,
    roomsTotal: 0,
    roomsAvailable: 0
  })

  // Fetch functions
  const fetchPatientCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      
    if (!error && count !== null) {
      setStats(prev => ({ ...prev, patientCount: count }))
    } else if (error) {
      console.error("Error fetching patient count:", error)
    }
  }, [])
  
  const fetchAppointmentsCount = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', today)
      
    if (!error && count !== null) {
      setStats(prev => ({ ...prev, appointmentsToday: count }))
    } else if (error) {
      console.error("Error fetching appointments count:", error)
    }
  }, [])
  
  const fetchStaffCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      
    if (!error && count !== null) {
      setStats(prev => ({ ...prev, staffCount: count }))
    } else if (error) {
      console.error("Error fetching staff count:", error)
    }
  }, [])
  
  const fetchInventoryCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      
    if (!error && count !== null) {
      setStats(prev => ({ ...prev, inventoryItems: count }))
    } else if (error) {
      console.error("Error fetching inventory count:", error)
      setStats(prev => ({ ...prev, inventoryItems: 0 }))
    }
  }, [])
  
  const fetchMedicalRecordsCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('medical_records')
      .select('*', { count: 'exact', head: true })
      
    if (!error && count !== null) {
      setStats(prev => ({ ...prev, medicalRecordsCount: count }))
    } else if (error) {
      console.error("Error fetching medical records count:", error)
      setStats(prev => ({ ...prev, medicalRecordsCount: 0 }))
    }
  }, [])

  const fetchBillingCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('billing')
      .select('*', { count: 'exact', head: true })
      
    if (!error && count !== null) {
      setStats(prev => ({ ...prev, billingCount: count }))
    } else if (error) {
      console.error("Error fetching billing count:", error)
      setStats(prev => ({ ...prev, billingCount: 0 }))
    }
  }, [])

  const fetchRevenueThisMonth = useCallback(async () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()
    
    const { data, error } = await supabase
      .from('billing')
      .select('amount')
      .gte('created_at', firstDayOfMonth)
      .lte('created_at', lastDayOfMonth)
      .eq('status', 'paid')
      
    if (!error && data) {
      const totalRevenue = data.reduce((sum, record) => sum + (Number(record.amount) || 0), 0)
      setStats(prev => ({ ...prev, revenueThisMonth: totalRevenue }))
    } else if (error) {
      // console.error("Error fetching revenue:", error)
      setStats(prev => ({ ...prev, revenueThisMonth: 0 }))
    }
  }, [])

  const fetchDepartmentsCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true })
      
    if (!error && count !== null) {
      setStats(prev => ({ ...prev, departmentsCount: count }))
    } else if (error) {
      console.error("Error fetching departments count:", error)
      setStats(prev => ({ ...prev, departmentsCount: 0 }))
    }
  }, [])

  const fetchRoomsData = useCallback(async () => {
    // Get total rooms count
    const { count: totalCount, error: totalError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      
    // Get occupied rooms count
    const { count: occupiedCount, error: occupiedError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'occupied')
      
    if (!totalError && totalCount !== null) {
      setStats(prev => ({ ...prev, roomsTotal: totalCount }))
      
      if (!occupiedError && occupiedCount !== null) {
        const availableRooms = totalCount - occupiedCount
        const occupancyPercentage = totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0
        
        setStats(prev => ({ 
          ...prev, 
          roomsAvailable: availableRooms,
          bedOccupancy: occupancyPercentage 
        }))
      }
    } else {
      console.error("Error fetching rooms data:", totalError || occupiedError)
      setStats(prev => ({ ...prev, roomsTotal: 0, roomsAvailable: 0, bedOccupancy: 0 }))
    }
  }, [])

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      await Promise.all([
        fetchPatientCount(),
        fetchAppointmentsCount(),
        fetchStaffCount(),
        fetchInventoryCount(),
        fetchMedicalRecordsCount(),
        fetchBillingCount(),
        fetchRevenueThisMonth(),
        fetchDepartmentsCount(),
        fetchRoomsData(),
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [
    fetchPatientCount, 
    fetchAppointmentsCount,
    fetchStaffCount,
    fetchInventoryCount,
    fetchMedicalRecordsCount,
    fetchBillingCount,
    fetchRevenueThisMonth,
    fetchDepartmentsCount,
    fetchRoomsData
  ])

  return {
    loading,
    stats,
    fetchDashboardData,
    fetchPatientCount,
    fetchAppointmentsCount,
    fetchStaffCount,
    fetchInventoryCount,
    fetchMedicalRecordsCount,
    fetchBillingCount,
    fetchRevenueThisMonth,
    fetchDepartmentsCount,
    fetchRoomsData
  }
}