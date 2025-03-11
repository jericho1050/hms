"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gauge, TrendingUp, TrendingDown, Bed, Users, ShoppingCart } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface OperationalReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  departmentFilter: string
  reportTypeFilter: string
}

export function OperationalReports({ dateRange, departmentFilter, reportTypeFilter }: OperationalReportsProps) {
  // Mock data for bed occupancy
  const bedOccupancy = [
    { department: "Emergency", total: 40, occupied: 32, available: 8 },
    { department: "ICU", total: 30, occupied: 28, available: 2 },
    { department: "Pediatrics", total: 45, occupied: 36, available: 9 },
    { department: "Surgery", total: 35, occupied: 30, available: 5 },
    { department: "Cardiology", total: 25, occupied: 22, available: 3 },
    { department: "Neurology", total: 20, occupied: 15, available: 5 },
    { department: "Oncology", total: 30, occupied: 27, available: 3 },
    { department: "Orthopedics", total: 25, occupied: 18, available: 7 },
  ]

  // Filter data based on department filter
  const filteredOccupancy =
    departmentFilter === "all"
      ? bedOccupancy
      : bedOccupancy.filter((dept) => dept.department.toLowerCase() === departmentFilter.toLowerCase())

  // Calculate occupancy rates
  const bedOccupancyRates = filteredOccupancy.map((dept) => ({
    department: dept.department,
    occupancyRate: Math.round((dept.occupied / dept.total) * 100),
  }))

  // Mock data for staff performance
  const staffPerformance = [
    { category: "Patient Care", nursing: 92, physicians: 88, support: 80 },
    { category: "Documentation", nursing: 85, physicians: 78, support: 90 },
    { category: "Communication", nursing: 88, physicians: 82, support: 85 },
    { category: "Teamwork", nursing: 90, physicians: 85, support: 88 },
    { category: "Efficiency", nursing: 82, physicians: 80, support: 82 },
    { category: "Protocol Adherence", nursing: 95, physicians: 90, support: 85 },
  ]

  // Mock data for inventory status
  const inventoryStatus = [
    { category: "Medications", inStock: 94, onOrder: 6, critical: false },
    { category: "Surgical Supplies", inStock: 82, onOrder: 18, critical: false },
    { category: "PPE", inStock: 78, onOrder: 22, critical: false },
    { category: "Laboratory Supplies", inStock: 89, onOrder: 11, critical: false },
    { category: "Cleaning Supplies", inStock: 92, onOrder: 8, critical: false },
    { category: "Office Supplies", inStock: 95, onOrder: 5, critical: false },
    { category: "Medical Devices", inStock: 68, onOrder: 32, critical: true },
    { category: "Linens", inStock: 87, onOrder: 13, critical: false },
  ]

  // Mock data for daily admissions
  const dailyAdmissions = [
    { day: "Monday", emergency: 28, scheduled: 35 },
    { day: "Tuesday", emergency: 24, scheduled: 42 },
    { day: "Wednesday", emergency: 30, scheduled: 38 },
    { day: "Thursday", emergency: 25, scheduled: 40 },
    { day: "Friday", emergency: 32, scheduled: 45 },
    { day: "Saturday", emergency: 36, scheduled: 22 },
    { day: "Sunday", emergency: 38, scheduled: 18 },
  ]

  // Mock data for resource utilization
  const resourceUtilization = [
    { resource: "Operating Rooms", utilization: 87 },
    { resource: "MRI Machines", utilization: 92 },
    { resource: "CT Scanners", utilization: 88 },
    { resource: "X-Ray Machines", utilization: 76 },
    { resource: "Ultrasound", utilization: 82 },
    { resource: "Lab Equipment", utilization: 90 },
    { resource: "Ambulances", utilization: 75 },
    { resource: "Ventilators", utilization: 68 },
  ]

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="space-y-6">
      {/* Top level metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
            <Bed className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-amber-500 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3.1%
              </span>{" "}
              vs. optimal capacity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +1.5%
              </span>{" "}
              vs. previous month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Levels</CardTitle>
            <ShoppingCart className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.6%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-amber-500 inline-flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2.4%
              </span>{" "}
              vs. target level
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
            <Gauge className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 min</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8 min
              </span>{" "}
              vs. target time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Bed Occupancy by Department</CardTitle>
            <CardDescription>Current occupancy rates across hospital departments</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredOccupancy}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" name="Occupied Beds" stackId="a" fill="#3b82f6" />
                <Bar dataKey="available" name="Available Beds" stackId="a" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Performance by Department</CardTitle>
            <CardDescription>Performance metrics across different staff categories</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} width={730} height={250} data={staffPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Nursing Staff" dataKey="nursing" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                <Radar name="Physicians" dataKey="physicians" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} />
                <Radar name="Support Staff" dataKey="support" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.6} />
                <Legend />
                <Tooltip formatter={(value) => `${value}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Admissions</CardTitle>
            <CardDescription>Emergency vs. scheduled admissions by day of week</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyAdmissions}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="emergency" name="Emergency Admissions" fill="#ef4444" />
                <Bar dataKey="scheduled" name="Scheduled Admissions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
          <CardDescription>Current inventory levels by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryStatus.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">{item.category}</span>
                    {item.critical && (
                      <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm">{item.inStock}% in stock</span>
                </div>
                <Progress value={item.inStock} className={item.critical ? "bg-red-100" : "bg-muted"} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.onOrder}% on order</span>
                  <span>Target: 100%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Utilization Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
          <CardDescription>Efficiency of medical equipment and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resourceUtilization.map((resource) => (
                  <TableRow key={resource.resource}>
                    <TableCell className="font-medium">{resource.resource}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={resource.utilization} className="w-[60%]" />
                        <span className="text-sm">{resource.utilization}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {resource.utilization > 90 ? (
                        <Badge className="bg-red-100 text-red-800">Over Utilized</Badge>
                      ) : resource.utilization > 75 ? (
                        <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">Under Utilized</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

