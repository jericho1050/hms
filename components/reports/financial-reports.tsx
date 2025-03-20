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

interface FinancialMetrics {
  totalRevenue: number
  outstandingBills: number
  insuranceClaims: number
  collectionRate: number
  revenueGrowth: number
  outstandingBillsGrowth: number
  insuranceClaimsGrowth: number
  collectionRateGrowth: number
  revenueByDepartment: Array<{
    name: string
    revenue: number
    target: number
  }>
  revenueTrends: Array<{
    month: string
    revenue: number
    expenses: number
  }>
  paymentDistribution: Array<{
    name: string
    value: number
  }>
}

interface FinancialReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  departmentFilter: string
  reportTypeFilter: string
  financialMetrics?: FinancialMetrics
  insuranceClaims?: Array<{
    id: string
    patient: string
    amount: number
    status: string
    provider: string
    submittedDate: string
    paidDate: string | null
  }>
}

// Add a helper function to format growth percentages
const formatGrowthPercentage = (value: number) => {
  if (Math.abs(value) > 1000) {
    return `${value > 0 ? '>' : '<'}1000`;
  }
  return value.toFixed(1);
};

export function FinancialReports({ 
  dateRange, 
  departmentFilter, 
  reportTypeFilter,
  financialMetrics,
  insuranceClaims = []
}: FinancialReportsProps) {
  // Check if we have real data to display
  const hasMetrics = financialMetrics !== undefined;
  const hasRevenueByDept = hasMetrics && financialMetrics.revenueByDepartment && financialMetrics.revenueByDepartment.length > 0;
  const hasRevenueTrends = hasMetrics && financialMetrics.revenueTrends && financialMetrics.revenueTrends.length > 0;
  const hasPaymentDistribution = hasMetrics && financialMetrics.paymentDistribution && financialMetrics.paymentDistribution.length > 0;
  const hasClaims = insuranceClaims && insuranceClaims.length > 0;

  // Filter revenue by department based on department filter
  const filteredRevenue = hasRevenueByDept 
    ? (departmentFilter === "all"
      ? financialMetrics.revenueByDepartment
      : financialMetrics.revenueByDepartment.filter(
          (dept) => dept.name.toLowerCase() === departmentFilter.toLowerCase()
        ))
    : [];

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

  if (!hasMetrics) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold">No financial data available</h2>
        <p className="text-muted-foreground max-w-md">
          There is no financial data available for the selected filters. Try changing your date range or department selection.
        </p>
      </div>
    );
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
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.totalRevenue, 0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${financialMetrics.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
                {financialMetrics.revenueGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {financialMetrics.revenueGrowth >= 0 ? '+' : ''}
                {formatGrowthPercentage(financialMetrics.revenueGrowth)}%
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
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.outstandingBills)}</div>         
            <p className="text-xs text-muted-foreground">
              <span className={`${financialMetrics.outstandingBillsGrowth <= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
                {financialMetrics.outstandingBillsGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {financialMetrics.outstandingBillsGrowth > 0 ? '+' : ''}
                {formatGrowthPercentage(financialMetrics.outstandingBillsGrowth)}%
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
            <div className="text-2xl font-bold">{financialMetrics.insuranceClaims}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${financialMetrics.insuranceClaimsGrowth <= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
                {financialMetrics.insuranceClaimsGrowth <= 0 ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1" />
                )}
                {formatGrowthPercentage(financialMetrics.insuranceClaimsGrowth)}%
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
            <div className="text-2xl font-bold">{financialMetrics.collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${financialMetrics.collectionRateGrowth >= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
                {financialMetrics.collectionRateGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {financialMetrics.collectionRateGrowth >= 0 ? '+' : ''}
                {formatGrowthPercentage(financialMetrics.collectionRateGrowth)}%
              </span>{" "}
              vs. target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        {hasRevenueByDept ? (
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
        ) : (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue by Department</CardTitle>
              <CardDescription>No department revenue data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">No revenue by department data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {hasRevenueTrends ? (
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs. Expenses (YTD)</CardTitle>
              <CardDescription>Monthly comparison of revenue and expenses</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={financialMetrics.revenueTrends}
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs. Expenses (YTD)</CardTitle>
              <CardDescription>No trend data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No revenue trend data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {hasPaymentDistribution ? (
          <Card>
            <CardHeader>
              <CardTitle>Payment Distribution</CardTitle>
              <CardDescription>Sources of payment for medical services</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialMetrics.paymentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {financialMetrics.paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Payment Distribution</CardTitle>
              <CardDescription>No distribution data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No payment distribution data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Insurance Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Insurance Claims</CardTitle>
          <CardDescription>Status and details of recently submitted insurance claims</CardDescription>
        </CardHeader>
        <CardContent>
          {hasClaims ? (
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
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No insurance claims data available for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

