"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
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

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [departments, setDepartments] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("all")
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false);
  useEffect(() => {
    async function loadData() {
      try {
        // In a real app, this would fetch data from an API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Set mock departments
        setDepartments([
          "Cardiology",
          "Neurology",
          "Orthopedics",
          "Pediatrics",
          "Oncology",
          "Radiology",
          "Emergency",
          "Surgery",
          "Administration",
          "Pharmacy",
          "Laboratory",
        ])
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const refreshData = async () => {
    setIsLoading(true)
    // In a real app, this would refresh data from the API
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const exportReport = (format: string) => {
    // In a real app, this would trigger a download of the report in the selected format
    console.log(`Exporting report in ${format} format`)
    alert(`Report export initiated in ${format} format`)
  }

  if (isLoading) {
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
                <DropdownMenuItem onClick={() => {
                  exportReport("pdf");
                  setIsExportOpen(false);
                }}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  exportReport("csv");
                  setIsExportOpen(false);
                }}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  exportReport("excel"); 
                  setIsExportOpen(false);
                }}>
                  Export as Excel
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
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
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
      <Tabs defaultValue="financial" className="w-full">
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

        <TabsContent value="financial" className="space-y-4">
          <FinancialReports
            dateRange={dateRange}
            departmentFilter={departmentFilter}
            reportTypeFilter={reportTypeFilter}
          />
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          <ClinicalReports
            dateRange={dateRange}
            departmentFilter={departmentFilter}
            reportTypeFilter={reportTypeFilter}
          />
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <OperationalReports
            dateRange={dateRange}
            departmentFilter={departmentFilter}
            reportTypeFilter={reportTypeFilter}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceReports
            dateRange={dateRange}
            departmentFilter={departmentFilter}
            reportTypeFilter={reportTypeFilter}
          />
        </TabsContent>
      </Tabs>

      {/* Report Scheduler Modal */}
      <ReportScheduler isOpen={isSchedulerOpen} onClose={() => setIsSchedulerOpen(false)} />
    </div>
  )
}

// DropdownMenu component
function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block text-left">{children}</div>
}

function DropdownMenuTrigger({ asChild, children }: { asChild: boolean; children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuContent({ align, children }: { align: string; children: React.ReactNode }) {
  return (
    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
      <div className="py-1">{children}</div>
    </div>
  )
}

function DropdownMenuItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100">
      {children}
    </button>
  )
}

