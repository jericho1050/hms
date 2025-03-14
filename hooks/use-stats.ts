import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/utils/supabase/client"
import { StatsState } from "@/types/stats"

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
    roomsAvailable: 0,
    // Initialize trend data
    trends: {
      patientCount: "0%",
      appointmentsToday: "0%",
      staffCount: "0%",
      revenueThisMonth: "0%",
      bedOccupancy: "0%",
      inventoryItems: "0%"
    },
    trendDirections: {
      patientCount: "neutral",
      appointmentsToday: "neutral",
      staffCount: "neutral",
      revenueThisMonth: "neutral",
      bedOccupancy: "neutral",
      inventoryItems: "neutral"
    }
  })

  const [departmentUtilizationData, setDepartmentUtilizationData] = useState<{ department: string; capacity: number }[]>([])

  // Fetch dashboard metrics using the view
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .single()
        
      if (error) {
        console.error("Error fetching dashboard metrics:", error)
        return
      }
      
      if (data) {
        setStats(prev => ({
          ...prev,
          patientCount: data.total_patients || 0,
          staffCount: data.total_staff || 0,
          appointmentsToday: data.today_appointments || 0,
          revenueThisMonth: data.monthly_revenue || 0,
          bedOccupancy: data.bed_occupancy_rate !== null ? Math.round(data.bed_occupancy_rate) : 0,
          inventoryItems: data.total_inventory_items || 0
        }))
      }
    } catch (error) {
      console.error("Error in fetchDashboardMetrics:", error)
    }
  }, [])

  // Helper function to calculate percentage change
  const calculatePercentageChange = (previous: number, current: number): number => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  // Keep these individual fetch functions for real-time updates
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
        
        setStats(prev => ({ 
          ...prev, 
          roomsAvailable: availableRooms
        }))
      }
    } else {
      console.error("Error fetching rooms data:", totalError || occupiedError)
      setStats(prev => ({ ...prev, roomsTotal: 0, roomsAvailable: 0 }))
    }
  }, [])

  // Fetch department utilization data
  const fetchDepartmentUtilization = useCallback(async () => {
    try {
      // Fetch departments
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id, name')
      
      if (deptError) {
        console.error("Error fetching departments:", deptError)
        return
      }
      
      if (!departments || departments.length === 0) {
        return
      }
      
      // Create initial data structure with 0 capacity
      const utilizationData: { department: string; capacity: number }[] = departments.map(dept => ({
        department: dept.name,
        capacity: 0
      }))
      
      // For each department, calculate bed occupancy
      for (const dept of departments) {
        // Get rooms for this department
        const { data: rooms, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .eq('department_id', dept.id)
        
        if (roomsError) {
          console.error(`Error fetching rooms for department ${dept.name}:`, roomsError)
          continue
        }
        
        if (!rooms || rooms.length === 0) {
          continue
        }
        
        // Calculate occupancy percentage for department based on room status
        const totalBeds = rooms.reduce((total, room) => {
          // Use the capacity property from the rooms table
          return total + room.capacity
        }, 0)
        
        const occupiedBeds = rooms.reduce((total, room) => {
          // Use the current_occupancy property from the rooms table
          return total + room.current_occupancy
        }, 0)
        
        const capacityPercentage = totalBeds > 0 
          ? Math.round((occupiedBeds / totalBeds) * 100) 
          : 0
        
        // Update the utilization data for this department
        const deptIndex = utilizationData.findIndex(d => d.department === dept.name)
        if (deptIndex >= 0) {
          utilizationData[deptIndex].capacity = capacityPercentage
        }
      }
      
      setDepartmentUtilizationData(utilizationData)
      return utilizationData
    } catch (error) {
      console.error("Error fetching department utilization:", error)
      return []
    }
  }, [])

  // Calculate trends (comparing with previous month's data)
  const calculateTrends = useCallback(async () => {
    try {
      // Get previous month's data for comparison
      const today = new Date()
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString()
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).toISOString()
      
      // Example: Calculate patient trend
      const { count: prevPatientCount, error: patientError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', firstDayLastMonth)
      
      if (!patientError && prevPatientCount !== null && prevPatientCount > 0) {
        const patientTrend = calculatePercentageChange(prevPatientCount, stats.patientCount)
        const patientTrendDirection = patientTrend > 0 ? "up" : patientTrend < 0 ? "down" : "neutral"
        
        setStats(prev => ({
          ...prev,
          trends: {
            ...prev.trends,
            patientCount: `${Math.abs(patientTrend).toFixed(1)}%`
          },
          trendDirections: {
            ...prev.trendDirections,
            patientCount: patientTrendDirection
          }
        }))
      }
      
      // Example: Calculate revenue trend
      const { data: prevRevenue, error: revenueError } = await supabase
        .from('billing')
        .select('total_amount')
        .gte('created_at', firstDayLastMonth)
        .lte('created_at', lastDayLastMonth)
        .eq('status', 'paid')
      
      if (!revenueError && prevRevenue) {
        const prevMonthRevenue = prevRevenue.reduce((sum, record) => sum + (Number(record.total_amount) || 0), 0)
        if (prevMonthRevenue > 0) {
          const revenueTrend = calculatePercentageChange(prevMonthRevenue, stats.revenueThisMonth)
          const revenueTrendDirection = revenueTrend > 0 ? "up" : revenueTrend < 0 ? "down" : "neutral"
          
          setStats(prev => ({
            ...prev,
            trends: {
              ...prev.trends,
              revenueThisMonth: `${Math.abs(revenueTrend).toFixed(1)}%`
            },
            trendDirections: {
              ...prev.trendDirections,
              revenueThisMonth: revenueTrendDirection
            }
          }))
        }
      }
      
      // For simplicity, set some placeholder trends for other metrics
      // In a real application, you would calculate these based on historical data
      setStats(prev => ({
        ...prev,
        trends: {
          ...prev.trends,
          appointmentsToday: "12.0%",
          staffCount: "0.0%",
          bedOccupancy: "3.1%",
          inventoryItems: "2.4%"
        },
        trendDirections: {
          ...prev.trendDirections,
          appointmentsToday: "up",
          staffCount: "neutral",
          bedOccupancy: "down",
          inventoryItems: "up"
        }
      }))
      
    } catch (error) {
      console.error("Error calculating trends:", error)
    }
  }, [stats.patientCount, stats.revenueThisMonth])

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      await fetchDashboardMetrics()
      
      // Fetch additional data not in the dashboard_metrics view
      await Promise.all([
        fetchMedicalRecordsCount(),
        fetchBillingCount(),
        fetchDepartmentsCount(),
        fetchRoomsData(),
        fetchDepartmentUtilization(),
      ])
      
      // Calculate trends after fetching current data
      await calculateTrends()
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [fetchDashboardMetrics, calculateTrends, fetchMedicalRecordsCount, fetchBillingCount, fetchDepartmentsCount, fetchRoomsData, fetchDepartmentUtilization])

  return {
    loading,
    stats,
    departmentUtilizationData,
    fetchDashboardData,
    fetchDashboardMetrics,
    fetchMedicalRecordsCount,
    fetchBillingCount,
    fetchDepartmentsCount,
    fetchRoomsData,
    fetchDepartmentUtilization,
  }
}