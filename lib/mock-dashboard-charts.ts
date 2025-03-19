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
      doctorName: "Michael Chen",
      department: "Cardiology",
      date: "2023-07-13",
      startTime: "09:00 AM",
      endTime: "09:30 AM",
      status: "scheduled"
    },
    {
      id: "A1002",
      patientName: "Robert Brown",
      doctorName: "Emily Taylor",
      department: "Neurology",
      date: "2023-07-13",
      startTime: "10:30 AM",
      endTime: "11:00 AM",
      status: "scheduled"
    },
    {
      id: "A1003",
      patientName: "James Miller",
      doctorName: "David Johnson",
      department: "Orthopedics",
      date: "2023-07-14",
      startTime: "02:00 PM",
      endTime: "02:45 PM",
      status: "scheduled"
    },
    {
      id: "A1004",
      patientName: "Mary Davis",
      doctorName: "Jessica Williams",
      department: "Pediatrics",
      date: "2023-07-14",
      startTime: "03:30 PM",
      endTime: "04:00 PM",
      status: "scheduled"
    },
    {
      id: "A1005",
      patientName: "Patricia Garcia",
      doctorName: "Joseph Martinez",
      department: "Dermatology",
      date: "2023-07-15",
      startTime: "11:00 AM",
      endTime: "11:30 AM",
      status: "scheduled"
    }
  ]
  
  // Financial Data
  export const financialMetricsData = {
    totalRevenue: 2850000,
    totalExpenses: 2100000,
    netProfit: 750000,
    previousPeriodRevenue: 2650000,
    previousPeriodExpenses: 2000000,
    previousPeriodProfit: 650000,
    revenueData: [
      { month: 'Jan', revenue: 210000, expenses: 160000 },
      { month: 'Feb', revenue: 240000, expenses: 170000 },
      { month: 'Mar', revenue: 280000, expenses: 190000 },
      { month: 'Apr', revenue: 250000, expenses: 180000 },
      { month: 'May', revenue: 320000, expenses: 230000 },
      { month: 'Jun', revenue: 350000, expenses: 250000 },
    ]
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
  
  export const appointmentsByDepartmentData = [
    { department: 'Cardiology', count: 24 },
    { department: 'Neurology', count: 18 },
    { department: 'Orthopedics', count: 15 },
    { department: 'Pediatrics', count: 22 },
    { department: 'Dermatology', count: 12 },
    { department: 'Oncology', count: 14 },
    { department: 'Gastroenterology', count: 16 },
  ];
  
  export const appointmentsByTypeData = [
    { type: 'Check-up', value: 42 },
    { type: 'Consultation', value: 28 },
    { type: 'Procedure', value: 15 },
    { type: 'Follow-up', value: 25 },
    { type: 'Emergency', value: 10 },
  ];
  
  