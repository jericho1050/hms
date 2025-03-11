"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, TrendingUp, AlertTriangle, ClipboardCheck, FileCheck } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ComplianceReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  departmentFilter: string
  reportTypeFilter: string
}

export function ComplianceReports({ dateRange, departmentFilter, reportTypeFilter }: ComplianceReportsProps) {
  // Mock data for compliance rates
  const complianceRates = [
    { requirement: "HIPAA Privacy", compliance: 98, target: 100 },
    { requirement: "Infection Control", compliance: 96, target: 95 },
    { requirement: "Medication Management", compliance: 94, target: 95 },
    { requirement: "Patient Rights", compliance: 97, target: 100 },
    { requirement: "Documentation", compliance: 92, target: 95 },
    { requirement: "Safety Protocols", compliance: 95, target: 95 },
    { requirement: "Staff Credentials", compliance: 99, target: 100 },
    { requirement: "Equipment Calibration", compliance: 91, target: 90 },
  ]

  // Filter data based on department filter
  const filteredCompliance = complianceRates.filter((item) => true) // All requirements apply to all departments

  // Mock data for compliance trends
  const complianceTrends = [
    { month: "Jan", compliance: 92 },
    { month: "Feb", compliance: 93 },
    { month: "Mar", compliance: 94 },
    { month: "Apr", compliance: 93 },
    { month: "May", compliance: 95 },
    { month: "Jun", compliance: 96 },
    { month: "Jul", compliance: 95 },
    { month: "Aug", compliance: 96 },
    { month: "Sep", compliance: 97 },
    { month: "Oct", compliance: 96 },
    { month: "Nov", compliance: 97 },
    { month: "Dec", compliance: 98 },
  ]

  // Mock data for audit findings
  const auditFindings = [
    {
      id: "AF-001",
      title: "Incomplete patient documentation",
      severity: "medium",
      department: "Nursing",
      status: "resolved",
      date: "2023-05-10",
    },
    {
      id: "AF-002",
      title: "Medication storage temperature deviation",
      severity: "high",
      department: "Pharmacy",
      status: "in-progress",
      date: "2023-05-15",
    },
    {
      id: "AF-003",
      title: "Missing staff credentials documentation",
      severity: "low",
      department: "HR",
      status: "resolved",
      date: "2023-04-28",
    },
    {
      id: "AF-004",
      title: "Improper waste disposal",
      severity: "medium",
      department: "Housekeeping",
      status: "resolved",
      date: "2023-05-05",
    },
    {
      id: "AF-005",
      title: "Patient privacy breach",
      severity: "high",
      department: "Reception",
      status: "resolved",
      date: "2023-04-15",
    },
    {
      id: "AF-006",
      title: "Equipment maintenance overdue",
      severity: "medium",
      department: "Radiology",
      status: "in-progress",
      date: "2023-05-18",
    },
    {
      id: "AF-007",
      title: "Non-compliance with hand hygiene",
      severity: "high",
      department: "Surgery",
      status: "resolved",
      date: "2023-05-02",
    },
    {
      id: "AF-008",
      title: "Incomplete informed consent",
      severity: "medium",
      department: "Cardiology",
      status: "in-progress",
      date: "2023-05-20",
    },
  ]

  // Mock data for incident distribution
  const incidentDistribution = [
    { name: "Documentation", value: 32 },
    { name: "Medication", value: 24 },
    { name: "Patient Rights", value: 18 },
    { name: "Infection Control", value: 14 },
    { name: "Equipment", value: 12 },
  ]

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Function to get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        )
      case "open":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Open
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Top level metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95.3%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1%
              </span>{" "}
              vs. previous quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Audit Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                -40%
              </span>{" "}
              vs. previous month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certifications Current</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">All required certifications up to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Staff Training</CardTitle>
            <FileCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +1.5%
              </span>{" "}
              vs. target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Compliance by Requirement</CardTitle>
            <CardDescription>Comparing current compliance levels against targets</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredCompliance}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="requirement" type="category" width={150} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="compliance" name="Current Compliance" fill="#3b82f6" />
                <Bar dataKey="target" name="Target Compliance" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Trend</CardTitle>
            <CardDescription>Overall compliance rate over the past year</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={complianceTrends}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[90, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  name="Compliance Rate"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Non-Compliance Incidents</CardTitle>
            <CardDescription>Distribution of non-compliance incidents by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {incidentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} incidents`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Audit Findings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Findings</CardTitle>
          <CardDescription>Details of recent compliance audit findings and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Finding</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditFindings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell className="font-medium">{finding.id}</TableCell>
                    <TableCell>{finding.title}</TableCell>
                    <TableCell>{finding.department}</TableCell>
                    <TableCell>{finding.date}</TableCell>
                    <TableCell>{getSeverityBadge(finding.severity)}</TableCell>
                    <TableCell>{getStatusBadge(finding.status)}</TableCell>
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

