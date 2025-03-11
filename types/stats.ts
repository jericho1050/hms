
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
    patientCount: string
    appointmentsToday: string
    staffCount: string
    revenueThisMonth: string
    bedOccupancy: string
    inventoryItems: string
  }
  trendDirections: {
    patientCount: "up" | "down" | "neutral"
    appointmentsToday: "up" | "down" | "neutral"
    staffCount: "up" | "down" | "neutral"
    revenueThisMonth: "up" | "down" | "neutral"
    bedOccupancy: "up" | "down" | "neutral"
    inventoryItems: "up" | "down" | "neutral"
  }
}