"use client"

import { useState, useEffect } from "react"
import { format as formatDate, startOfMonth, endOfMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  DownloadCloud,
  RefreshCw,
  CalendarIcon,
  BarChart4,
  PieChart,
  LineChart,
  ClipboardList,
  Filter,
  Bell,
  Loader2,
} from "lucide-react"
import { FinancialReports } from "@/components/reports/financial-reports"
import { ClinicalReports } from "@/components/reports/clinical-reports"
import { OperationalReports } from "@/components/reports/operational-reports"
import { ComplianceReports } from "@/components/reports/compliance-reports"
import { ReportScheduler } from "@/components/reports/report-scheduler"
import { cn } from "@/lib/utils"
import { supabase } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import { formatCurrency } from "@/lib/utils"

// Define types for our data structures
type RevenueDept = {
  name: string;
  revenue: number;
  target: number;
}

type InsuranceClaim = {
  id: string;
  patient: string;
  amount: number;
  status: string;
  provider: string;
  submittedDate: string;
  paidDate: string | null;
}

type DemographicData = {
  gender: string;
  count: number;
}

type AgeData = {
  age: string;
  count: number;
}

type PatientDemographics = {
  genderDistribution: DemographicData[];
  ageDistribution: AgeData[];
}

type AppointmentStats = {
  totalAppointments: number;
  completedAppointments: number;
  noShowAppointments: number;
  pendingAppointments: number;
  completionRate: number;
  noShowRate: number;
}

type BedOccupancy = {
  department: string;
  total: number;
  occupied: number;
  available: number;
}

type FinancialSummary = {
  totalRevenue: number;
  outstandingBills: number;
  insuranceClaimsCount: number;
  collectionRate: number;
}

type StaffDeptMap = {
  [key: string]: string;
}

type DeptCounts = {
  [key: string]: number;
}

type DeptOccupancy = {
  [key: string]: BedOccupancy;
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [departments, setDepartments] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("financial")
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  // Data states with proper typing
  const [revenueByDept, setRevenueByDept] = useState<RevenueDept[]>([])
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([])
  const [patientDemographics, setPatientDemographics] = useState<PatientDemographics>({
    genderDistribution: [],
    ageDistribution: []
  })
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    noShowAppointments: 0,
    pendingAppointments: 0,
    completionRate: 0,
    noShowRate: 0
  })
  const [bedOccupancy, setBedOccupancy] = useState<BedOccupancy[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    outstandingBills: 0,
    insuranceClaimsCount: 0,
    collectionRate: 0
  })

  useEffect(() => {
    loadData()
  }, [dateRange, departmentFilter, reportTypeFilter])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load departments for filtering
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id, name')
        .order('name')

      if (deptError) throw deptError
      setDepartments(deptData?.map(d => d.name) || [])

      // Format dates for querying
      const fromDate = dateRange.from ? formatDate(dateRange.from, 'yyyy-MM-dd') : formatDate(startOfMonth(new Date()), 'yyyy-MM-dd')
      const toDate = dateRange.to ? formatDate(dateRange.to, 'yyyy-MM-dd') : formatDate(endOfMonth(new Date()), 'yyyy-MM-dd')

      // Load financial data
      await loadFinancialData(fromDate, toDate)

      // Load patient demographics
      await loadPatientDemographics()

      // Load appointment statistics
      await loadAppointmentStats(fromDate, toDate)

      // Load bed occupancy
      await loadBedOccupancy()

    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load report data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadFinancialData = async (fromDate: string, toDate: string) => {
    try {
      // Get total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('billing')
        .select('total_amount, payment_status, payment_date, invoice_date, insurance_claim_id')
        .gte('invoice_date', fromDate)
        .lte('invoice_date', toDate)

      if (revenueError) throw revenueError

      // Calculate financial metrics
      const totalRevenue = revenueData?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
      const outstandingBills = revenueData?.filter(bill => bill.payment_status === 'pending')
        .reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
      const insuranceClaimsCount = revenueData?.filter(bill => bill.insurance_claim_id !== null).length || 0
      const paidAmount = revenueData?.filter(bill => bill.payment_status === 'paid')
        .reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
      const collectionRate = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0

      setFinancialSummary({
        totalRevenue,
        outstandingBills,
        insuranceClaimsCount,
        collectionRate
      })

      // Get revenue by department (simplified approach)
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, department')

      if (staffData) {
        // Create a map of staff IDs to departments
        const staffDeptMap: StaffDeptMap = {}
        if (staffData) {
          staffData.forEach(staff => {
            staffDeptMap[staff.id] = staff.department
          })
        }

        // Get appointments with billing
        const { data: appointmentData } = await supabase
          .from('appointments')
          .select('staff_id')
          .gte('appointment_date', fromDate)
          .lte('appointment_date', toDate)

        if (appointmentData) {
          // Count appointments by department
          const deptCounts: DeptCounts = {}
          appointmentData.forEach(appt => {
            const dept = staffDeptMap[appt.staff_id]
            if (dept) {
              deptCounts[dept] = (deptCounts[dept] || 0) + 1
            }
          })

          // Convert to revenue by department (approximation)
          const avgRevenue = totalRevenue / (appointmentData.length || 1)
          const deptRevenue = Object.entries(deptCounts).map(([name, count]) => ({
            name,
            revenue: avgRevenue * count,
            target: avgRevenue * count * 1.1 // 10% higher target
          }))

          setRevenueByDept(deptRevenue)
        }
      }

      // Get insurance claims with patient info
      if (revenueData) {
        const claimsData = revenueData.filter(bill => bill.insurance_claim_id !== null).slice(0, 10)
        
        const claims = claimsData.map(claim => ({
          id: claim.insurance_claim_id || `CL-${Math.floor(Math.random() * 10000)}`,
          patient: "Patient Name", // We'll fetch this from patients table where possible
          amount: claim.total_amount,
          status: claim.payment_status,
          provider: "Insurance Provider", // Placeholder
          submittedDate: claim.invoice_date,
          paidDate: claim.payment_date
        }))

        setInsuranceClaims(claims)
      }
    } catch (error) {
      console.error("Error loading financial data:", error)
    }
  }

  const loadPatientDemographics = async () => {
    try {
      // Get patient data for demographics
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('gender, date_of_birth')

      if (patientError) throw patientError

      // Process gender distribution
      const genderCounts = { Male: 0, Female: 0, Other: 0 }
      
      // Process age distribution
      const ageCounts = { 
        '0-18': 0, 
        '19-35': 0, 
        '36-50': 0, 
        '51-65': 0, 
        '66+': 0 
      }

      if (patientData) {
        patientData.forEach(patient => {
          // Gender counts
          if (patient.gender === 'male') genderCounts.Male++
          else if (patient.gender === 'female') genderCounts.Female++
          else genderCounts.Other++

          // Age counts
          if (patient.date_of_birth) {
            const birthDate = new Date(patient.date_of_birth)
            const age = new Date().getFullYear() - birthDate.getFullYear()
            
            if (age <= 18) ageCounts['0-18']++
            else if (age <= 35) ageCounts['19-35']++
            else if (age <= 50) ageCounts['36-50']++
            else if (age <= 65) ageCounts['51-65']++
            else ageCounts['66+']++
          }
        })
      }

      // Format for charts
      const genderData = Object.entries(genderCounts).map(([gender, count]) => ({ gender, count }))
      const ageData = Object.entries(ageCounts).map(([age, count]) => ({ age, count }))

      setPatientDemographics({
        genderDistribution: genderData,
        ageDistribution: ageData
      })
    } catch (error) {
      console.error("Error loading patient demographics:", error)
    }
  }

  const loadAppointmentStats = async (fromDate: string, toDate: string) => {
    try {
      // Get appointment data
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('status, appointment_date')
        .gte('appointment_date', fromDate)
        .lte('appointment_date', toDate)

      if (appointmentError) throw appointmentError

      if (appointmentData) {
        const totalAppointments = appointmentData.length
        const completedAppointments = appointmentData.filter(appt => appt.status === 'completed').length
        const noShowAppointments = appointmentData.filter(appt => appt.status === 'no-show').length
        const pendingAppointments = appointmentData.filter(appt => appt.status === 'scheduled').length
        
        const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0
        const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0

        setAppointmentStats({
          totalAppointments,
          completedAppointments,
          noShowAppointments,
          pendingAppointments,
          completionRate,
          noShowRate
        })
      }
    } catch (error) {
      console.error("Error loading appointment stats:", error)
    }
  }

  const loadBedOccupancy = async () => {
    try {
      // Get room and occupancy data
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('room_number, capacity, current_occupancy, department_id, room_type')

      if (roomError) throw roomError

      if (roomData) {
        // Get department info
        const { data: deptData } = await supabase
          .from('departments')
          .select('id, name')

        // Create department ID to name mapping
        const deptMap: StaffDeptMap = {}
        if (deptData) {
          deptData.forEach(dept => {
            deptMap[dept.id] = dept.name
          })
        }

        // Format for bed occupancy chart
        const bedOccupancyData = roomData.map(room => ({
          room: room.room_number,
          department: room.department_id ? (deptMap[room.department_id] ?? 'Unknown') : 'Unknown',
          type: room.room_type,
          capacity: room.capacity,
          occupied: room.current_occupancy,
          available: room.capacity - room.current_occupancy,
          occupancyRate: room.capacity > 0 ? (room.current_occupancy / room.capacity) * 100 : 0
        }))

        // Group by department
        const deptOccupancy: DeptOccupancy = {}
        bedOccupancyData.forEach(room => {
          if (!deptOccupancy[room.department]) {
            deptOccupancy[room.department] = {
              department: room.department,
              total: 0,
              occupied: 0,
              available: 0
            }
          }
          deptOccupancy[room.department].total += room.capacity
          deptOccupancy[room.department].occupied += room.occupied
          deptOccupancy[room.department].available += room.available
        })

        setBedOccupancy(Object.values(deptOccupancy))
      }
    } catch (error) {
      console.error("Error loading bed occupancy:", error)
    }
  }

  const refreshData = async () => {
    toast({
      title: "Refreshing",
      description: "Updating report data...",
    })
    await loadData()
    toast({
      title: "Refreshed",
      description: "Report data has been updated.",
    })
  }

  const handleExportReport = (format: string) => {
    try {
      if (format === "pdf") {
        const doc = new jsPDF()
        
        // Add title
        doc.setFontSize(20)
        doc.text("Hospital Management System Report", 20, 20)
        
        // Add date
        doc.setFontSize(12)
        const today = new Date()
        doc.text(`Report generated on: ${formatDate(today, 'MMMM dd, yyyy')}`, 20, 30)
        
        // Add financial summary
        doc.setFontSize(16)
        doc.text("Financial Summary", 20, 45)
        doc.setFontSize(12)
        doc.text(`Total Revenue: ${formatCurrency(financialSummary.totalRevenue)}`, 25, 55)
        doc.text(`Outstanding Bills: ${formatCurrency(financialSummary.outstandingBills)}`, 25, 65)
        doc.text(`Insurance Claims: ${financialSummary.insuranceClaimsCount}`, 25, 75)
        doc.text(`Collection Rate: ${financialSummary.collectionRate.toFixed(2)}%`, 25, 85)
        
        // Add bed occupancy
        if (bedOccupancy.length > 0) {
          doc.setFontSize(16)
          doc.text("Bed Occupancy", 20, 100)
          doc.setFontSize(12)
          
          let yPos = 110
          bedOccupancy.forEach((dept: BedOccupancy) => {
            const occupancyRate = dept.total > 0 ? ((dept.occupied/dept.total)*100).toFixed(1) : '0.0'
            doc.text(`${dept.department}: ${dept.occupied}/${dept.total} (${occupancyRate}%)`, 25, yPos)
            yPos += 10
          })
        }
        
        // Save the PDF
        doc.save(`hospital-report-${formatDate(today, 'yyyy-MM-dd')}.pdf`)
      } else if (format === "csv") {
        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,"
        
        // Add financial data
        csvContent += "Financial Summary\n"
        csvContent += "Metric,Value\n"
        csvContent += `Total Revenue,${financialSummary.totalRevenue}\n`
        csvContent += `Outstanding Bills,${financialSummary.outstandingBills}\n`
        csvContent += `Insurance Claims,${financialSummary.insuranceClaimsCount}\n`
        csvContent += `Collection Rate,${financialSummary.collectionRate.toFixed(2)}%\n\n`
        
        // Add revenue by department
        if (revenueByDept.length > 0) {
          csvContent += "Revenue by Department\n"
          csvContent += "Department,Revenue,Target\n"
          revenueByDept.forEach(dept => {
            csvContent += `${dept.name},${dept.revenue},${dept.target}\n`
          })
          csvContent += "\n"
        }
        
        // Add bed occupancy
        if (bedOccupancy.length > 0) {
          csvContent += "Bed Occupancy\n"
          csvContent += "Department,Total,Occupied,Available\n"
          bedOccupancy.forEach((dept: BedOccupancy) => {
            csvContent += `${dept.department},${dept.total},${dept.occupied},${dept.available}\n`
          })
        }
        
        // Create download link
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `hospital-report-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      toast({
        title: "Export successful",
        description: `Report exported in ${format.toUpperCase()} format.`,
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting the report.",
        variant: "destructive",
      })
    }
    
    setIsExportOpen(false)
  }

  if (isLoading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and analyze comprehensive hospital reports</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex gap-2"
                onClick={() => setIsExportOpen(!isExportOpen)}
              >
                <DownloadCloud className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            {isExportOpen && (
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportReport("pdf")}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportReport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
          <Button onClick={() => setIsSchedulerOpen(true)} className="flex gap-2">
            <Bell className="h-4 w-4" />
            Schedule Reports
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-[300px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {formatDate(dateRange.from, "LLL dd, y")} - {formatDate(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        formatDate(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    autoFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium mb-1">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department.toLowerCase()}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="summary">Summary Reports</SelectItem>
                  <SelectItem value="detailed">Detailed Reports</SelectItem>
                  <SelectItem value="trend">Trend Analysis</SelectItem>
                  <SelectItem value="comparative">Comparative Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={refreshData} disabled={isLoading} className="h-10">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs 
        defaultValue="financial" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="financial" className="flex gap-2 items-center">
            <BarChart4 className="h-4 w-4" />
            <span>Financial</span>
          </TabsTrigger>
          <TabsTrigger value="clinical" className="flex gap-2 items-center">
            <LineChart className="h-4 w-4" />
            <span>Clinical</span>
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex gap-2 items-center">
            <PieChart className="h-4 w-4" />
            <span>Operational</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex gap-2 items-center">
            <ClipboardList className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="mt-0">
          <FinancialReports
            dateRange={dateRange}
            departmentFilter={departmentFilter}
            reportTypeFilter={reportTypeFilter}
            financialMetrics={{
              totalRevenue: financialSummary.totalRevenue,
              outstandingBills: financialSummary.outstandingBills,
              insuranceClaims: financialSummary.insuranceClaimsCount,
              collectionRate: financialSummary.collectionRate,
              revenueGrowth: 12.5, // Placeholder
              outstandingBillsGrowth: 3.2, // Placeholder
              insuranceClaimsGrowth: -5.4, // Placeholder
              collectionRateGrowth: 2.1, // Placeholder
              revenueByDepartment: revenueByDept,
              revenueTrends: [
                { month: "Jan", revenue: 280000, expenses: 240000 },
                { month: "Feb", revenue: 300000, expenses: 238000 },
                { month: "Mar", revenue: 358000, expenses: 245000 },
                { month: "Apr", revenue: 320000, expenses: 230000 },
                { month: "May", revenue: 410000, expenses: 250000 },
                { month: "Jun", revenue: 380000, expenses: 260000 },
                { month: "Jul", revenue: 390000, expenses: 270000 },
                { month: "Aug", revenue: 405000, expenses: 265000 },
                { month: "Sep", revenue: 430000, expenses: 275000 },
                { month: "Oct", revenue: 440000, expenses: 280000 },
                { month: "Nov", revenue: 450000, expenses: 290000 },
                { month: "Dec", revenue: 480000, expenses: 300000 },
              ],
              paymentDistribution: [
                { name: "Insurance", value: 68 },
                { name: "Out-of-pocket", value: 22 },
                { name: "Government", value: 8 },
                { name: "Other", value: 2 },
              ]
            }}
            insuranceClaims={insuranceClaims}
          />
        </TabsContent>

        <TabsContent value="clinical" className="mt-0">
          <ClinicalReports
            dateRange={dateRange}
            departmentFilter={departmentFilter}
            reportTypeFilter={reportTypeFilter}
            clinicalMetrics={{
              patientsByAge: patientDemographics.ageDistribution || [],
              patientsByGender: patientDemographics.genderDistribution || [],
              diagnosisFrequency: [
                { name: "Cardiovascular", count: 324 },
                { name: "Respiratory", count: 256 },
                { name: "Neurological", count: 187 },
                { name: "Digestive", count: 142 },
                { name: "Musculoskeletal", count: 198 },
                { name: "Endocrine", count: 113 },
                { name: "Infectious", count: 167 },
                { name: "Other", count: 98 },
              ],
              treatmentOutcomes: [
                { treatment: "Medication", success: 85, failure: 15 },
                { treatment: "Surgery", success: 78, failure: 22 },
                { treatment: "Therapy", success: 92, failure: 8 },
                { treatment: "Radiation", success: 65, failure: 35 },
                { treatment: "Alternative", success: 72, failure: 28 },
              ]
            }}
          />
        </TabsContent>

        <TabsContent value="operational" className="mt-0">
          <OperationalReports
            dateRange={dateRange}
            departmentFilter={departmentFilter}
            reportTypeFilter={reportTypeFilter}
            operationalMetrics={{
              appointmentCompletionRate: appointmentStats.completionRate || 0,
              noShowRate: appointmentStats.noShowRate || 0,
              averageWaitTime: 27, // Placeholder
              bedOccupancyRate: bedOccupancy.length > 0 ? 
                bedOccupancy.reduce((sum: number, dept: BedOccupancy) => sum + dept.occupied, 0) / 
                bedOccupancy.reduce((sum: number, dept: BedOccupancy) => sum + dept.total, 0) * 100 : 0,
              roomUtilization: bedOccupancy.map((dept: BedOccupancy) => ({
                room: dept.department,
                utilizationRate: dept.total > 0 ? (dept.occupied / dept.total) * 100 : 0
              })),
              staffUtilization: [
                { department: "Emergency", utilizationRate: 95 },
                { department: "Surgery", utilizationRate: 83 },
                { department: "Cardiology", utilizationRate: 78 },
                { department: "Neurology", utilizationRate: 85 },
                { department: "Radiology", utilizationRate: 72 },
                { department: "Pediatrics", utilizationRate: 65 },
                { department: "Orthopedics", utilizationRate: 92 },
                { department: "Oncology", utilizationRate: 88 },
              ]
            }}
          />
        </TabsContent>

        <TabsContent value="compliance" className="mt-0">
          <ComplianceReports
            dateRange={dateRange}
            departmentFilter={departmentFilter}
            reportTypeFilter={reportTypeFilter}
            complianceMetrics={{
              medicationErrors: [
                { department: 'Emergency', count: 5, change: -2 },
                { department: 'Surgery', count: 3, change: 1 },
                { department: 'Pharmacy', count: 4, change: -1 }
              ],
              incidentReports: [
                { category: 'Falls', count: 3, previousCount: 4 },
                { category: 'Medication', count: 2, previousCount: 3 },
                { category: 'Equipment', count: 1, previousCount: 1 },
                { category: 'Documentation', count: 2, previousCount: 0 }
              ],
              regulatoryCompliance: [
                { regulation: 'HIPAA', complianceRate: 98, status: "compliant" },
                { regulation: 'Safety', complianceRate: 92, status: "compliant" },
                { regulation: 'Medical Records', complianceRate: 88, status: "at-risk" },
                { regulation: 'Staff Credentials', complianceRate: 100, status: "compliant" }
              ],
              auditsCompleted: [
                { department: 'Internal Medicine', completed: 2, total: 3 },
                { department: 'Surgery', completed: 1, total: 2 },
                { department: 'Pediatrics', completed: 1, total: 1 },
                { department: 'Emergency', completed: 1, total: 3 }
              ],
              riskAssessments: [
                { area: 'Infection Control', riskLevel: 25, priority: 'medium' },
                { area: 'Medication Safety', riskLevel: 35, priority: 'high' },
                { area: 'Patient Falls', riskLevel: 42, priority: 'high' },
                { area: 'Equipment Safety', riskLevel: 18, priority: 'low' },
                { area: 'Data Security', riskLevel: 30, priority: 'medium' }
              ]
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Report Scheduler Modal */}
      {isSchedulerOpen && (
        <ReportScheduler
          onClose={() => setIsSchedulerOpen(false)} 
          dateRange={dateRange}
          departmentFilter={departmentFilter}
          reportTypeFilter={reportTypeFilter}
          activeTab={activeTab}
        />
      )}
    </div>
  )
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}

function DropdownMenuTrigger({ asChild, children }: { asChild: boolean; children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuContent({ align, children }: { align: string; children: React.ReactNode }) {
  return (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white/90 dark:bg-black/90 backdrop-blur-sm border dark:border-gray-800 z-20">
      <div className="py-1">{children}</div>
    </div>
  )
}

function DropdownMenuItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

