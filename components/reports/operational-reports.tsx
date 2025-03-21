"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gauge, TrendingUp, TrendingDown, Bed, Users, ShoppingCart, AlertTriangle } from "lucide-react"
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

interface OperationalMetrics {
  appointmentCompletionRate?: number
  noShowRate?: number
  averageWaitTime?: number
  bedOccupancyRate?: number
  roomUtilization?: Array<{
    room: string
    utilizationRate: number
  }>
  staffUtilization?: Array<{
    department: string
    utilizationRate: number
  }>
  bedOccupancy?: Array<{
    department: string
    total: number
    occupied: number
    available: number
  }>
  staffPerformance?: Array<{
    category: string
    nursing: number
    physicians: number
    support: number
  }>
  inventoryStatus?: Array<{
    category: string
    inStock: number
    onOrder: number
    critical: boolean
  }>
  dailyAdmissions?: Array<{
    day: string
    emergency: number
    scheduled: number
  }>
  staffUtilizationRate?: number
  staffUtilizationChange?: number
  roomOccupancyHistory?: Array<{
    room_id: string | null
    room_number: string | null
    department_id: string | null
    department_name: string | null
    date: string | null
    patients_admitted: number | null
    current_patients: number | null
    capacity: number | null
    occupancy_rate: number | null
  }>
}

interface OperationalReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  departmentFilter: string
  reportTypeFilter: string
  operationalMetrics?: OperationalMetrics
}

export function OperationalReports({ 
  dateRange, 
  departmentFilter, 
  reportTypeFilter,
  operationalMetrics
}: OperationalReportsProps) {
  // Check if we have real data to display
  const hasMetrics = operationalMetrics !== undefined;
  const hasBedOccupancy = hasMetrics && operationalMetrics.bedOccupancy && operationalMetrics.bedOccupancy.length > 0;
  const hasStaffPerformance = hasMetrics && operationalMetrics.staffPerformance && operationalMetrics.staffPerformance.length > 0;
  const hasInventoryStatus = hasMetrics && operationalMetrics.inventoryStatus && operationalMetrics.inventoryStatus.length > 0;
  const hasDailyAdmissions = hasMetrics && operationalMetrics.dailyAdmissions && operationalMetrics.dailyAdmissions.length > 0;
  const hasRoomUtilization = hasMetrics && operationalMetrics.roomUtilization && operationalMetrics.roomUtilization.length > 0;
  const hasStaffUtilization = hasMetrics && operationalMetrics.staffUtilization && operationalMetrics.staffUtilization.length > 0;

  // Filter bed occupancy data based on department filter if available
  const filteredOccupancy = hasBedOccupancy && operationalMetrics?.bedOccupancy
    ? (departmentFilter === "all"
      ? operationalMetrics.bedOccupancy
      : operationalMetrics.bedOccupancy.filter((dept) => dept.department.toLowerCase() === departmentFilter.toLowerCase()))
    : [];

  // Calculate occupancy rates if bed occupancy data is available
  const bedOccupancyRates = filteredOccupancy.map((dept) => ({
    department: dept.department,
    occupancyRate: Math.round((dept.occupied / dept.total) * 100),
  }));

  // Format room utilization data for the table view if available
  const formattedResourceUtilization = hasRoomUtilization && operationalMetrics?.roomUtilization
    ? operationalMetrics.roomUtilization.map(item => ({
        resource: item.room,
        utilization: item.utilizationRate
      }))
    : [];

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  if (!hasMetrics) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold">No operational data available</h2>
        <p className="text-muted-foreground max-w-md">
          There is no operational data available for the selected filters. Try changing your date range or department selection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Beta notification banner */}
      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              Beta Feature
            </p>
            <p className="text-sm mt-1">
              This reports module is still under development. Some metrics may be incomplete or display test data.
              Please report any issues you encounter.
            </p>
          </div>
        </div>
      </div>

      {/* Top level metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
            <Bed className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationalMetrics.bedOccupancyRate?.toFixed(1) || '-'}%</div>
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
            <div className="text-2xl font-bold">{operationalMetrics.staffUtilizationRate?.toFixed(1) || '-'}%</div>
            {operationalMetrics.staffUtilizationChange !== undefined && (
              <p className="text-xs text-muted-foreground">
                <span className={`${operationalMetrics.staffUtilizationChange >= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
                  {operationalMetrics.staffUtilizationChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {operationalMetrics.staffUtilizationChange >= 0 ? '+' : ''}
                  {operationalMetrics.staffUtilizationChange.toFixed(1)}%
                </span>{" "}
                vs. previous month
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointment Completion</CardTitle>
            <ShoppingCart className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationalMetrics.appointmentCompletionRate?.toFixed(1) || '-'}%</div>
            {operationalMetrics.noShowRate !== undefined && (
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 inline-flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.4%
                </span>{" "}
                vs. target level
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
            <Gauge className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationalMetrics.averageWaitTime || '-'} min</div>
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
  {/* Resource Utilization Table */}
  <Card>
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
          <CardDescription>Efficiency of medical equipment and resources</CardDescription>
        </CardHeader>
        <CardContent>
          {hasRoomUtilization && operationalMetrics?.roomUtilization ? (
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
                  {formattedResourceUtilization.map((resource) => (
                    <TableRow key={resource.resource}>
                      <TableCell className="font-medium">{resource.resource}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={resource.utilization} className="w-[60%]" />
                          <span className="text-sm">{resource.utilization.toFixed(2)}%</span>
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
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No resource utilization data available for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        {hasBedOccupancy && operationalMetrics?.bedOccupancy ? (
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
        ) : (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Bed Occupancy by Department</CardTitle>
              <CardDescription>No bed occupancy data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No bed occupancy data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {hasStaffPerformance && operationalMetrics?.staffPerformance ? (
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance by Department</CardTitle>
              <CardDescription>Performance metrics across different staff categories</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} width={730} height={250} data={operationalMetrics.staffPerformance}>
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance by Department</CardTitle>
              <CardDescription>No staff performance data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No staff performance data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {hasDailyAdmissions && operationalMetrics?.dailyAdmissions ? (
          <Card>
            <CardHeader>
              <CardTitle>Daily Admissions</CardTitle>
              <CardDescription>Emergency vs. scheduled admissions by day of week</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={operationalMetrics.dailyAdmissions}
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Daily Admissions</CardTitle>
              <CardDescription>No admissions data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No daily admissions data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Room Occupancy History Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Room Occupancy History</CardTitle>
          <CardDescription>Historical room occupancy rates from the database</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {operationalMetrics?.roomOccupancyHistory && operationalMetrics.roomOccupancyHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={operationalMetrics.roomOccupancyHistory.slice(0, 10)} // Take only the most recent 10 records
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="room_number" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  label={{ value: 'Occupancy Rate (%)', angle: -90, position: 'insideLeft' }} 
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'occupancy_rate') return [`${value.toFixed(1)}%`, 'Occupancy Rate'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="occupancy_rate" 
                  name="Occupancy Rate" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1000} 
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-muted-foreground">No room occupancy history data available.</p>
              <p className="text-xs text-muted-foreground">Try adjusting the date range filter or refreshing the page.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Occupancy History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Room Occupancy Details</CardTitle>
          <CardDescription>Detailed view of room occupancy history</CardDescription>
        </CardHeader>
        <CardContent>
          {operationalMetrics?.roomOccupancyHistory && operationalMetrics.roomOccupancyHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Current Patients</TableHead>
                  <TableHead>Occupancy Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operationalMetrics.roomOccupancyHistory.slice(0, 8).map((room, i) => (
                  <TableRow key={`${room.room_id || i}-${i}`}>
                    <TableCell className="font-medium">{room.room_number || 'N/A'}</TableCell>
                    <TableCell>{room.department_name || 'Unassigned'}</TableCell>
                    <TableCell>{room.date ? new Date(room.date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{room.capacity ?? 'N/A'}</TableCell>
                    <TableCell>{room.current_patients ?? 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={room.occupancy_rate ?? 0} className="w-20" />
                        <span>{(room.occupancy_rate ?? 0).toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">No room occupancy history data available.</p>
              <p className="text-xs text-muted-foreground mt-2">Try adjusting the date range filter or refreshing the page.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
          <CardDescription>Current inventory levels by category</CardDescription>
        </CardHeader>
        <CardContent>
          {hasInventoryStatus && operationalMetrics?.inventoryStatus ? (
            <div className="space-y-4">
              {operationalMetrics.inventoryStatus.map((item) => (
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
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No inventory status data available for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

    
    </div>
  )
}

