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
import { useReports } from "@/hooks/use-reports"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import { formatCurrency } from "@/lib/utils"
import autoTable from "jspdf-autotable"




export default function ReportsPage() {
  const { toast } = useToast()
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("financial")
  const [isStaffUtilizationAvailable, setIsStaffUtilizationAvailable] = useState(false)

  
  // Use the useReports hook to get all report data and actions
  const {
    isLoading,
    departments,
    dateRange,
    setDateRange,
    departmentFilter,
    setDepartmentFilter,
    reportTypeFilter, 
    setReportTypeFilter,
    revenueByDept,
    insuranceClaims,
    appointmentStats,
    bedOccupancy,
    financialSummary,
    revenueTrends,
    paymentDistribution,
    financialGrowth,
    calculateAverageWaitTime,
    fetchStaffUtilization,
    clinicalMetrics,
    operationalMetrics,
    refreshData
  } = useReports();

  // For Operational Reports
  const [staffUtilization, setStaffUtilization] = useState<any>(null);

  useEffect(() => {
    const loadStaffUtilization = async () => {
      try {
        const data = await fetchStaffUtilization();
        setStaffUtilization(data);
        setIsStaffUtilizationAvailable(true);
      } catch (error) {
        console.error('Error fetching staff utilization:', error);
        setIsStaffUtilizationAvailable(false);
      }
    };
    loadStaffUtilization();
  }, [fetchStaffUtilization]);

  const handleExportReport = (format: string) => {
    setIsExportOpen(false)
    toast({
      title: "Generating Report",
      description: `Preparing ${activeTab} report in ${format.toUpperCase()} format...`,
    })

    try {
      if (format === 'pdf') {
        // Generate PDF report
        const doc = new jsPDF()
        
        // Set title
        doc.setFontSize(20)
        doc.text(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`, 14, 20)
        
        // Add date range
        doc.setFontSize(12)
        doc.text(
          `Date Range: ${dateRange.from ? formatDate(dateRange.from, 'PPP') : 'All time'} - ${dateRange.to ? formatDate(dateRange.to, 'PPP') : 'Present'}`, 
          14, 
          30
        )
        
        // Add department filter
        doc.text(
          `Department: ${departmentFilter === 'all' ? 'All Departments' : departmentFilter}`,
          14,
          40
        )
        
        // Add timestamp
        doc.setFontSize(10)
        doc.text(`Generated on ${formatDate(new Date(), 'PPP')}`, 14, 50)
        
        // Add appropriate content based on active tab
        if (activeTab === 'financial') {
          // Financial summary
          doc.setFontSize(14)
          doc.text("Financial Summary", 14, 70)
          doc.setFontSize(11)
          doc.text(`Total Revenue: ${formatCurrency(financialSummary.totalRevenue)}`, 20, 80)
          doc.text(`Outstanding Bills: ${formatCurrency(financialSummary.outstandingBills)}`, 20, 90)
          doc.text(`Insurance Claims: ${financialSummary.insuranceClaimsCount}`, 20, 100)
          doc.text(`Collection Rate: ${financialSummary.collectionRate.toFixed(1)}%`, 20, 110)
          
          // Revenue by department table
          if (revenueByDept.length > 0) {
            doc.setFontSize(14)
            doc.text("Revenue by Department", 14, 130)
            
            let y = 140
            revenueByDept.forEach((dept, i) => {
              doc.setFontSize(11)
              doc.text(`${dept.name}: ${formatCurrency(dept.revenue)}`, 20, y + (i * 10))
            })
          }
        } else if (activeTab === 'clinical') {
          // Clinical metrics
          if (clinicalMetrics) {
            doc.setFontSize(14)
            doc.text("Clinical Overview", 14, 70)
            
            if (clinicalMetrics.patientSatisfaction) {
              doc.setFontSize(11)
              doc.text(`Patient Satisfaction: ${clinicalMetrics.patientSatisfaction.rate.toFixed(1)}%`, 20, 80)
            }
            
            if (clinicalMetrics.lengthOfStay) {
              doc.text(`Average Length of Stay: ${clinicalMetrics.lengthOfStay.days.toFixed(1)} days`, 20, 90)
            }
            
            if (clinicalMetrics.readmissionRate) {
              doc.text(`Readmission Rate: ${clinicalMetrics.readmissionRate.rate.toFixed(1)}%`, 20, 100)
            }
            
            if (clinicalMetrics.mortalityRate) {
              doc.text(`Mortality Rate: ${clinicalMetrics.mortalityRate.rate.toFixed(1)}%`, 20, 110)
            }
            
            // Diagnosis frequency
            if (clinicalMetrics.diagnosisFrequency && clinicalMetrics.diagnosisFrequency.length > 0) {
              const sortedDiagnoses = [...clinicalMetrics.diagnosisFrequency].sort((a, b) => b.count - a.count).slice(0, 10);
              
              (doc as any).setFontSize(14)
              (doc as any).text("Top Diagnoses", 14, 130)
              
              // Use autotable for better formatting
              autoTable(doc, {
                startY: 135,
                head: [['Diagnosis', 'Count']],
                body: sortedDiagnoses.map(diag => [diag.name, diag.count]),
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] },
                margin: { left: 14 },
              });
              
              // Add treatment outcomes if available
              if (clinicalMetrics.treatmentOutcomes && clinicalMetrics.treatmentOutcomes.length > 0) {
                doc.addPage();
                doc.setFontSize(14);
                doc.text("Treatment Outcomes", 14, 20);
                
                autoTable(doc,{
                  startY: 25,
                  head: [['Treatment', 'Success Rate', 'Failure Rate']],
                  body: clinicalMetrics.treatmentOutcomes.map(treatment => [
                    treatment.treatment, 
                    `${treatment.success}%`, 
                    `${treatment.failure}%`
                  ]),
                  theme: 'striped',
                  headStyles: { fillColor: [41, 128, 185] },
                  margin: { left: 14 },
                });
              }
              
              // Add readmission rates if available
              if (clinicalMetrics.readmissionRates && clinicalMetrics.readmissionRates.length > 0) {
                const currentY = (doc as any).lastAutoTable?.finalY || 160;
                
                if (currentY > 220) {
                  doc.addPage();
                  doc.setFontSize(14);
                  doc.text("Readmission Rates", 14, 20);
                  
                  autoTable(doc,{
                    startY: 25,
                    head: [['Month', 'Rate (%)']],
                    body: clinicalMetrics.readmissionRates.map(item => [
                      item.month,
                      item.rate.toFixed(1)
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 185] },
                    margin: { left: 14 },
                  });
                } else {
                  doc.setFontSize(14);
                  doc.text("Readmission Rates", 14, currentY + 10);
                  
                  autoTable(doc,{
                    startY: currentY + 15,
                    head: [['Month', 'Rate (%)']],
                    body: clinicalMetrics.readmissionRates.map(item => [
                      item.month,
                      item.rate.toFixed(1)
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 185] },
                    margin: { left: 14 },
                  });
                }
              }
            }
          }
        } else if (activeTab === 'operational') {
          // Operational metrics
          doc.setFontSize(14)
          doc.text("Operational Summary", 14, 70)
          doc.setFontSize(11)
          
          if (appointmentStats) {
            doc.text(`Total Appointments: ${appointmentStats.totalAppointments}`, 20, 80)
            doc.text(`Completion Rate: ${appointmentStats.completionRate.toFixed(1)}%`, 20, 90)
            doc.text(`No-Show Rate: ${appointmentStats.noShowRate.toFixed(1)}%`, 20, 100)
          }
          
          // Bed occupancy
          if (bedOccupancy.length > 0) {
            doc.setFontSize(14)
            doc.text("Bed Occupancy by Department", 14, 120)
            
            let y = 130
            bedOccupancy.forEach((dept, i) => {
              const occupancyRate = dept.total > 0 ? ((dept.occupied / dept.total) * 100).toFixed(1) : "0.0"
              doc.setFontSize(11)
              doc.text(`${dept.department}: ${occupancyRate}% (${dept.occupied}/${dept.total})`, 20, y + (i * 10))
            })
          }
        } else if (activeTab === 'compliance') {
          doc.setFontSize(14)
          doc.text("Compliance Summary", 14, 70)
          doc.setFontSize(11)
          doc.text("This feature is currently under development and will be available soon.", 20, 80)
        }
        
        // Save the PDF
        doc.save(`${activeTab}-report-${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`)
        
        toast({
          title: "Report Generated",
          description: `Your ${activeTab} report has been downloaded as a PDF file.`,
        })
      } else {
        // Handle other formats (CSV, Excel, etc.)
        toast({
          title: "Format Not Supported",
          description: `${format.toUpperCase()} format is not currently supported. Please use PDF.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
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
              revenueGrowth: financialGrowth.revenueGrowth,
              outstandingBillsGrowth: financialGrowth.outstandingBillsGrowth,
              insuranceClaimsGrowth: financialGrowth.insuranceClaimsGrowth,
              collectionRateGrowth: financialGrowth.collectionRateGrowth,
              revenueByDepartment: revenueByDept,
              revenueTrends: revenueTrends,
              paymentDistribution: paymentDistribution,
            }}
            insuranceClaims={insuranceClaims}
          />
        </TabsContent>

        <TabsContent value="clinical" className="mt-0">
          <ClinicalReports
            dateRange={dateRange}
            departmentFilter={departmentFilter}
            reportTypeFilter={reportTypeFilter}
            clinicalMetrics={clinicalMetrics}
          />
        </TabsContent>

        <TabsContent value="operational" className="mt-0">
          {calculateAverageWaitTime() === undefined && !isStaffUtilizationAvailable ? (
            // Only show partial development message if key metrics are missing
            <div className="flex flex-col space-y-6">
              <OperationalReports
                dateRange={dateRange}
                departmentFilter={departmentFilter}
                reportTypeFilter={reportTypeFilter}
                operationalMetrics={operationalMetrics}
              />
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Some operational metrics are currently under development and will be available soon.
                </p>
              </div>
            </div>
          ) : (
            <OperationalReports
              dateRange={dateRange}
              departmentFilter={departmentFilter}
              reportTypeFilter={reportTypeFilter}
              operationalMetrics={{
                appointmentCompletionRate: appointmentStats.completionRate || 0,
                noShowRate: appointmentStats.noShowRate || 0,
                averageWaitTime: calculateAverageWaitTime() || 0,
                bedOccupancyRate: bedOccupancy.length > 0 ? 
                  bedOccupancy.reduce((sum, dept) => sum + dept.occupied, 0) / 
                  bedOccupancy.reduce((sum, dept) => sum + dept.total, 0) * 100 : 0,
                roomUtilization: bedOccupancy.map((dept) => ({
                  room: dept.department,
                  utilizationRate: dept.total > 0 ? (dept.occupied / dept.total) * 100 : 0
                })),
                staffUtilization: staffUtilization,
                dailyAdmissions: operationalMetrics?.dailyAdmissions || [
                  { day: "Mon", emergency: 12, scheduled: 28 },
                  { day: "Tue", emergency: 8, scheduled: 30 },
                  { day: "Wed", emergency: 10, scheduled: 25 },
                  { day: "Thu", emergency: 15, scheduled: 22 },
                  { day: "Fri", emergency: 7, scheduled: 32 },
                  { day: "Sat", emergency: 18, scheduled: 15 },
                  { day: "Sun", emergency: 20, scheduled: 10 }
                ],
                bedOccupancy: bedOccupancy,
                staffPerformance: operationalMetrics?.staffPerformance || [

                ],
                inventoryStatus: operationalMetrics?.inventoryStatus || [

                ],
                roomOccupancyHistory: operationalMetrics?.roomOccupancyHistory && operationalMetrics.roomOccupancyHistory.length > 0 
                  ? operationalMetrics.roomOccupancyHistory 
                  : Array.from({ length: 1 }, (_, i) => ({
                      room_id: ``,
                      room_number: ``,
                      department_id: ``,
                      department_name: bedOccupancy[i % bedOccupancy.length]?.department || `Department ${i}`,
                      date: new Date().toISOString(),
                      patients_admitted: 0,
                      current_patients: 0,
                      capacity: 0,
                      occupancy_rate: 0
                    }))
              }}
            />
          )}
        </TabsContent>
        <TabsContent value="compliance" className="mt-0">
          {/* Replace with development notice since we don't have compliance data yet */}
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg max-w-md">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Feature Under Development
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                Compliance reporting is currently under development and will be available soon. 
                This feature will include medication error tracking, incident reporting, and regulatory compliance monitoring.
              </p>
            </div>
          </div>
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

