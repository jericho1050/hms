// Patient Admissions Data (last 30 days)
export const patientAdmissionsData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    admissions: Math.floor(Math.random() * 20) + 10,
  }))
  
  // Department Utilization Data
  export const departmentUtilizationData = [
    { department: "Emergency", capacity: 85 },
    { department: "ICU", capacity: 92 },
    { department: "Pediatrics", capacity: 65 },
    { department: "Surgery", capacity: 78 },
    { department: "Cardiology", capacity: 88 },
    { department: "Neurology", capacity: 72 },
  ]
  
  // Recent Patients Data
  export const recentPatientsData = [
    {
      id: "P1001",
      name: "John Smith",
      dateAdmitted: "2025-03-12",
      contact: "+1 (555) 123-4567",
      status: "Admitted",
    },
    {
      id: "P1002",
      name: "Emma Johnson",
      dateAdmitted: "2025-03-11",
      contact: "+1 (555) 234-5678",
      status: "Outpatient",
    },
    // Add more patient records...
  ]
  
  // Upcoming Appointments Data
  export const upcomingAppointmentsData = [
    {
      id: "A1001",
      patientName: "Sarah Wilson",
      doctorName: "Dr. Michael Chen",
      time: "09:00 AM",
      date: "2025-03-13",
      department: "Cardiology",
    },
    {
      id: "A1002",
      patientName: "Robert Brown",
      doctorName: "Dr. Emily Taylor",
      time: "10:30 AM",
      date: "2025-03-13",
      department: "Neurology",
    },
    // Add more appointments...
  ]
  
  // Financial Data
  export const financialMetricsData = {
    totalRevenue: 2850000,
    totalExpenses: 2100000,
    netProfit: 750000,
    previousPeriodRevenue: 2650000,
    previousPeriodExpenses: 2000000,
    previousPeriodProfit: 650000,
  }
  
  export const departmentFinancialsData = [
    {
      department: "Emergency",
      revenue: 850000,
      expenses: 620000,
      profit: 230000,
    },
    {
      department: "Surgery",
      revenue: 720000,
      expenses: 520000,
      profit: 200000,
    },
    // Add more department financials...
  ]
  
  