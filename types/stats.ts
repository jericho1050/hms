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
  // Add trend data
  trends: {
    patientCount: number
    appointmentsToday: number
    staffCount: number
    revenueThisMonth: number
    bedOccupancy: number
    inventoryItems: number
  }
  trendDirections: {
    patientCount: "up" | "down" | "neutral"
    appointmentsToday: "up" | "down" | "neutral"
    staffCount: "up" | "down" | "neutral"
    revenueThisMonth: "up" | "down" | "neutral"
    bedOccupancy: "up" | "down" | "neutral"
    inventoryItems: "up" | "down" | "neutral"
  }
  // Appointment data for dashboard
  appointmentsByDepartment: Array<{ department: string; count: number }>
  appointmentsByType: Array<{ type: string; value: number }>
  upcomingAppointments: Array<{
    id: string
    patientName: string
    doctorName: string
    department: string
    date: string
    startTime: string
    endTime: string
    status: string
  }>
}