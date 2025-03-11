"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
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

interface FinancialReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  departmentFilter: string
  reportTypeFilter: string
}

export function FinancialReports({ dateRange, departmentFilter, reportTypeFilter }: FinancialReportsProps) {
  // Mock data for revenue by department
  const revenueByDepartment = [
    { name: "Cardiology", revenue: 385000, target: 400000 },
    { name: "Neurology", revenue: 320000, target: 300000 },
    { name: "Orthopedics", revenue: 275000, target: 250000 },
    { name: "Pediatrics", revenue: 210000, target: 200000 },
    { name: "Oncology", revenue: 420000, target: 380000 },
    { name: "Radiology", revenue: 180000, target: 190000 },
    { name: "Emergency", revenue: 310000, target: 300000 },
    { name: "Surgery", revenue: 450000, target: 420000 },
  ]

  // Filter data based on department filter
  const filteredRevenue =
    departmentFilter === "all"
      ? revenueByDepartment
      : revenueByDepartment.filter((dept) => dept.name.toLowerCase() === departmentFilter)

  // Mock data for revenue trends
  const revenueTrends = [
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
  ]

  // Mock data for insurance claims
  const insuranceClaims = [
    {
      id: "CL-3842",
      patient: "John Doe",
      amount: 2450.75,
      status: "paid",
      provider: "Blue Cross",
      submittedDate: "2023-05-15",
      paidDate: "2023-05-30",
    },
    {
      id: "CL-3843",
      patient: "Sarah Johnson",
      amount: 1875.5,
      status: "pending",
      provider: "Aetna",
      submittedDate: "2023-05-16",
      paidDate: null,
    },
    {
      id: "CL-3844",
      patient: "Michael Smith",
      amount: 3200.0,
      status: "paid",
      provider: "UnitedHealthcare",
      submittedDate: "2023-05-14",
      paidDate: "2023-05-29",
    },
    {
      id: "CL-3845",
      patient: "Emily Davis",
      amount: 950.25,
      status: "denied",
      provider: "Cigna",
      submittedDate: "2023-05-12",
      paidDate: null,
    },
    {
      id: "CL-3846",
      patient: "David Wilson",
      amount: 1250.0,
      status: "paid",
      provider: "Medicare",
      submittedDate: "2023-05-10",
      paidDate: "2023-05-25",
    },
    {
      id: "CL-3847",
      patient: "Jennifer Brown",
      amount: 1780.5,
      status: "pending",
      provider: "Humana",
      submittedDate: "2023-05-17",
      paidDate: null,
    },
    {
      id: "CL-3848",
      patient: "Robert Taylor",
      amount: 2100.75,
      status: "paid",
      provider: "Kaiser",
      submittedDate: "2023-05-09",
      paidDate: "2023-05-24",
    },
    {
      id: "CL-3849",
      patient: "Jessica Martinez",
      amount: 850.0,
      status: "pending",
      provider: "Blue Cross",
      submittedDate: "2023-05-18",
      paidDate: null,
    },
  ]

  // Mock data for payment distribution
  const paymentDistribution = [
    { name: "Insurance", value: 68 },
    { name: "Out-of-pocket", value: 22 },
    { name: "Government", value: 8 },
    { name: "Other", value: 2 },
  ]

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Pending
          </Badge>
        )
      case "denied":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Denied
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(4643000, 0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>{" "}
              vs. previous year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Bills</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(687250)}</div>          <p className="text-xs text-muted-foreground">
              <span className="text-red-500 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3.2%
              </span>{" "}
              vs. previous month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Insurance Claims</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">842</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -5.4%
              </span>{" "}
              pending claims
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1%
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
            <CardTitle>Revenue by Department</CardTitle>
            <CardDescription>Comparison of actual revenue against targets by department</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredRevenue}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => `$${(Number(value)).toLocaleString()}`}
                  labelFormatter={(label) => `Department: ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" name="Actual Revenue" fill="#1e40af" />
                <Bar dataKey="target" name="Target Revenue" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue vs. Expenses (YTD)</CardTitle>
            <CardDescription>Monthly comparison of revenue and expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueTrends}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `$${(Number(value)).toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#1e40af"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Distribution</CardTitle>
            <CardDescription>Sources of payment for medical services</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insurance Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Insurance Claims</CardTitle>
          <CardDescription>Status and details of recently submitted insurance claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insuranceClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.id}</TableCell>
                    <TableCell>{claim.patient}</TableCell>
                    <TableCell>{formatCurrency(claim.amount)}</TableCell>
                    <TableCell>{claim.provider}</TableCell>
                    <TableCell>{claim.submittedDate}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>a
        </CardContent>
      </Card>
    </div>
  )
}

