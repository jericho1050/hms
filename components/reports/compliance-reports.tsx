"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
} from "recharts"

// Define interfaces for our metrics
interface ComplianceMetrics {
  medicationErrors?: Array<{
    department: string
    count: number
    change: number
  }>
  incidentReports?: Array<{
    category: string
    count: number
    previousCount: number
  }>
  regulatoryCompliance?: Array<{
    regulation: string
    complianceRate: number
    status: "compliant" | "at-risk" | "non-compliant"
  }>
  auditsCompleted?: Array<{
    department: string
    completed: number
    total: number
  }>
  riskAssessments?: Array<{
    area: string
    riskLevel: number
    priority: "low" | "medium" | "high" | "critical"
  }>
}

interface ComplianceReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  departmentFilter: string
  reportTypeFilter: string
  complianceMetrics?: ComplianceMetrics
}

export function ComplianceReports({ 
  dateRange, 
  departmentFilter, 
  reportTypeFilter,
  complianceMetrics
}: ComplianceReportsProps) {
  // Check if we have real data to display
  const hasMetrics = complianceMetrics !== undefined;
  const hasMedicationErrors = hasMetrics && complianceMetrics.medicationErrors && complianceMetrics.medicationErrors.length > 0;
  const hasIncidentReports = hasMetrics && complianceMetrics.incidentReports && complianceMetrics.incidentReports.length > 0;
  const hasRegulatoryCompliance = hasMetrics && complianceMetrics.regulatoryCompliance && complianceMetrics.regulatoryCompliance.length > 0;
  const hasAuditsCompleted = hasMetrics && complianceMetrics.auditsCompleted && complianceMetrics.auditsCompleted.length > 0;
  const hasRiskAssessments = hasMetrics && complianceMetrics.riskAssessments && complianceMetrics.riskAssessments.length > 0;

  // Filter medication errors data based on department filter if available
  const filteredMedicationErrors = complianceMetrics?.medicationErrors?.filter((error) => error.department.toLowerCase() === departmentFilter.toLowerCase()) || [];

  // Filter audits completed based on department filter if available
  const filteredAudits = complianceMetrics?.auditsCompleted?.filter((audit) => audit.department.toLowerCase() === departmentFilter.toLowerCase()) || [];

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]
  const statusColors = {
    "compliant": "#22c55e",
    "at-risk": "#f59e0b",
    "non-compliant": "#ef4444"
  }
  const priorityColors = {
    "low": "#22c55e",
    "medium": "#f59e0b",
    "high": "#ef4444",
    "critical": "#7f1d1d"
  }

  if (!hasMetrics) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold">No compliance data available</h2>
        <p className="text-muted-foreground max-w-md">
          There is no compliance data available for the selected filters. Try changing your date range or department selection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {hasMedicationErrors && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Medication Errors</CardTitle>
              <CardDescription>Total across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredMedicationErrors?.reduce((sum, dept) => sum + dept.count, 0)}
              </div>
              <div className="mt-4 h-1 w-full bg-muted">
                <div
                  className="h-1 bg-blue-600"
                  style={{ width: "40%" }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className={`${filteredMedicationErrors?.reduce((sum, dept) => sum + dept.change, 0) < 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {filteredMedicationErrors?.reduce((sum, dept) => sum + dept.change, 0) < 0 ? '↓' : '↑'} 
                  {Math.abs(filteredMedicationErrors?.reduce((sum, dept) => sum + dept.change, 0) || 0)}%
                </span> from previous period
              </p>
            </CardContent>
          </Card>
        )}

        {hasIncidentReports && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Incident Reports</CardTitle>
              <CardDescription>Filed this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {complianceMetrics?.incidentReports?.reduce((sum, incident) => sum + incident.count, 0)}
              </div>
              <div className="mt-4 h-1 w-full bg-muted">
                <div
                  className="h-1 bg-amber-600"
                  style={{ width: "60%" }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className={`${
                  (complianceMetrics?.incidentReports?.reduce((sum, incident) => sum + incident.count, 0) || 0) - 
                  (complianceMetrics?.incidentReports?.reduce((sum, incident) => sum + incident.previousCount, 0) || 0) < 0 
                  ? 'text-green-500' : 'text-red-500'}`}>
                  {
                    (complianceMetrics?.incidentReports?.reduce((sum, incident) => sum + incident.count, 0) || 0) - 
                    (complianceMetrics?.incidentReports?.reduce((sum, incident) => sum + incident.previousCount, 0) || 0) < 0 
                    ? '↓' : '↑'
                  } 
                  {Math.abs(
                    (complianceMetrics?.incidentReports?.reduce((sum, incident) => sum + incident.count, 0) || 0) - 
                    (complianceMetrics?.incidentReports?.reduce((sum, incident) => sum + incident.previousCount, 0) || 0)
                  )}
                </span> from previous period
              </p>
            </CardContent>
          </Card>
        )}

        {hasRegulatoryCompliance && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Regulatory Compliance</CardTitle>
              <CardDescription>Average rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((complianceMetrics?.regulatoryCompliance?.reduce((sum, reg) => sum + reg.complianceRate, 0) || 0) / 
                  (complianceMetrics?.regulatoryCompliance?.length || 1)).toFixed(1)}%
              </div>
              <div className="mt-4 h-1 w-full bg-muted">
                <div
                  className="h-1 bg-green-600"
                  style={{ 
                    width: `${(complianceMetrics?.regulatoryCompliance?.reduce((sum, reg) => sum + reg.complianceRate, 0) || 0) / 
                    (complianceMetrics?.regulatoryCompliance?.length || 1)}%` 
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Target is 100% compliance
              </p>
            </CardContent>
          </Card>
        )}

        {hasAuditsCompleted && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Audits Completed</CardTitle>
              <CardDescription>This period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredAudits?.reduce((sum, dept) => sum + dept.completed, 0)}/
                {filteredAudits?.reduce((sum, dept) => sum + dept.total, 0)}
              </div>
              <div className="mt-4 h-1 w-full bg-muted">
                <div
                  className="h-1 bg-purple-600"
                  style={{ 
                    width: `${(filteredAudits?.reduce((sum, dept) => sum + dept.completed, 0) || 0) / 
                    (filteredAudits?.reduce((sum, dept) => sum + dept.total, 0) || 1) * 100}%` 
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {((filteredAudits?.reduce((sum, dept) => sum + dept.completed, 0) || 0) / 
                (filteredAudits?.reduce((sum, dept) => sum + dept.total, 0) || 1) * 100).toFixed(1)}% completion rate
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {hasMedicationErrors ? (
          <Card>
            <CardHeader>
              <CardTitle>Medication Errors by Department</CardTitle>
              <CardDescription>Number of reported errors during this period</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredMedicationErrors}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Error Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Medication Errors by Department</CardTitle>
              <CardDescription>No medication error data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No medication error data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {hasIncidentReports ? (
          <Card>
            <CardHeader>
              <CardTitle>Incident Reports by Category</CardTitle>
              <CardDescription>Breakdown of reported incidents</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceMetrics?.incidentReports}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="category"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {complianceMetrics?.incidentReports?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} incidents`, props.payload.category]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Incident Reports by Category</CardTitle>
              <CardDescription>No incident report data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No incident report data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {hasRegulatoryCompliance ? (
        <Card>
          <CardHeader>
            <CardTitle>Regulatory Compliance Status</CardTitle>
            <CardDescription>Status of compliance with key regulations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Regulation</TableHead>
                    <TableHead className="w-[100px] text-right">Rate</TableHead>
                    <TableHead className="w-[100px] text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceMetrics?.regulatoryCompliance?.map((regulation) => (
                    <TableRow key={regulation.regulation}>
                      <TableCell className="font-medium">{regulation.regulation}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress
                            value={regulation.complianceRate}
                            className={`w-[80px] ${
                              regulation.status === "compliant"
                                ? "bg-muted [&>div]:bg-green-600"
                                : regulation.status === "at-risk"
                                ? "bg-muted [&>div]:bg-amber-600"
                                : "bg-muted [&>div]:bg-red-600"
                            }`}
                          />
                          <span>{regulation.complianceRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={
                            regulation.status === "compliant"
                              ? "bg-green-100 text-green-800"
                              : regulation.status === "at-risk"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {regulation.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Regulatory Compliance Status</CardTitle>
            <CardDescription>No regulatory compliance data available</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No regulatory compliance data available for the selected filters.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {hasAuditsCompleted ? (
          <Card>
            <CardHeader>
              <CardTitle>Audit Completion by Department</CardTitle>
              <CardDescription>Progress on scheduled audits</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredAudits}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#3b82f6" name="Completed" />
                  <Bar dataKey="total" stackId="a" fill="#93c5fd" name="Total Required" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Audit Completion by Department</CardTitle>
              <CardDescription>No audit completion data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No audit completion data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {hasRiskAssessments ? (
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Summary</CardTitle>
              <CardDescription>Identified risk levels by area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceMetrics?.riskAssessments?.map((item) => (
                  <div key={item.area} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">{item.area}</span>
                        <Badge
                          variant="outline"
                          className="ml-2"
                          style={{
                            backgroundColor: `${priorityColors[item.priority]}20`,
                            color: priorityColors[item.priority],
                          }}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <span className="text-sm">{item.riskLevel}% risk</span>
                    </div>
                    <Progress
                      value={item.riskLevel}
                      className={
                        item.priority === "critical"
                          ? "bg-muted [&>div]:bg-red-800"
                          : item.priority === "high"
                          ? "bg-muted [&>div]:bg-red-600"
                          : item.priority === "medium"
                          ? "bg-muted [&>div]:bg-amber-600"
                          : "bg-muted [&>div]:bg-green-600"
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Summary</CardTitle>
              <CardDescription>No risk assessment data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No risk assessment data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

