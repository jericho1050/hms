"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActivitySquare, TrendingUp, TrendingDown, Heart, Stethoscope, BarChartIcon } from "lucide-react"
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
  AreaChart,
  Area,
} from "recharts"

interface ClinicalReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  departmentFilter: string
  reportTypeFilter: string
}

export function ClinicalReports({ dateRange, departmentFilter, reportTypeFilter }: ClinicalReportsProps) {
  // Mock data for diagnosis distribution
  const diagnosisDistribution = [
    { name: "Cardiovascular", count: 324 },
    { name: "Respiratory", count: 256 },
    { name: "Neurological", count: 187 },
    { name: "Digestive", count: 142 },
    { name: "Musculoskeletal", count: 198 },
    { name: "Endocrine", count: 113 },
    { name: "Infectious", count: 167 },
    { name: "Other", count: 98 },
  ]

  // Filter data based on department filter
  const filteredDiagnoses =
    departmentFilter === "all"
      ? diagnosisDistribution
      : diagnosisDistribution.filter((diag) => {
          const dept = departmentFilter.toLowerCase()
          if (dept === "cardiology") return diag.name === "Cardiovascular"
          if (dept === "neurology") return diag.name === "Neurological"
          if (dept === "orthopedics") return diag.name === "Musculoskeletal"
          if (dept === "pediatrics") return diag.name.includes("Pediatric")
          if (dept === "oncology") return diag.name.includes("Cancer")
          if (dept === "pulmonology") return diag.name === "Respiratory"
          if (dept === "endocrinology") return diag.name === "Endocrine"
          return false
        })

  // Mock data for patient outcomes
  const patientOutcomes = [
    { month: "Jan", improved: 78, stable: 15, deteriorated: 7 },
    { month: "Feb", improved: 82, stable: 12, deteriorated: 6 },
    { month: "Mar", improved: 75, stable: 18, deteriorated: 7 },
    { month: "Apr", improved: 80, stable: 14, deteriorated: 6 },
    { month: "May", improved: 85, stable: 10, deteriorated: 5 },
    { month: "Jun", improved: 79, stable: 15, deteriorated: 6 },
    { month: "Jul", improved: 83, stable: 12, deteriorated: 5 },
    { month: "Aug", improved: 87, stable: 9, deteriorated: 4 },
    { month: "Sep", improved: 82, stable: 13, deteriorated: 5 },
    { month: "Oct", improved: 84, stable: 11, deteriorated: 5 },
    { month: "Nov", improved: 86, stable: 10, deteriorated: 4 },
    { month: "Dec", improved: 88, stable: 9, deteriorated: 3 },
  ]

  // Mock data for treatment effectiveness
  const treatmentEffectiveness = [
    { treatment: "Treatment A", success: 87, failure: 13 },
    { treatment: "Treatment B", success: 75, failure: 25 },
    { treatment: "Treatment C", success: 92, failure: 8 },
    { treatment: "Treatment D", success: 68, failure: 32 },
    { treatment: "Treatment E", success: 83, failure: 17 },
    { treatment: "Treatment F", success: 78, failure: 22 },
  ]

  // Mock data for readmission rates
  const readmissionRates = [
    { month: "Jan", rate: 5.2 },
    { month: "Feb", rate: 4.8 },
    { month: "Mar", rate: 5.0 },
    { month: "Apr", rate: 4.5 },
    { month: "May", rate: 4.2 },
    { month: "Jun", rate: 4.0 },
    { month: "Jul", rate: 3.8 },
    { month: "Aug", rate: 3.6 },
    { month: "Sep", rate: 3.5 },
    { month: "Oct", rate: 3.3 },
    { month: "Nov", rate: 3.2 },
    { month: "Dec", rate: 3.0 },
  ]

  // Mock data for common procedures
  const commonProcedures = [
    { procedure: "Cardiac Catheterization", count: 187, avgTime: 45, complicationRate: 2.1 },
    { procedure: "Colonoscopy", count: 245, avgTime: 30, complicationRate: 0.8 },
    { procedure: "MRI Scan", count: 312, avgTime: 60, complicationRate: 0.2 },
    { procedure: "Appendectomy", count: 98, avgTime: 75, complicationRate: 3.5 },
    { procedure: "Joint Replacement", count: 124, avgTime: 120, complicationRate: 4.2 },
    { procedure: "Endoscopy", count: 218, avgTime: 25, complicationRate: 1.2 },
    { procedure: "Biopsy", count: 156, avgTime: 40, complicationRate: 1.8 },
    { procedure: "C-Section", count: 78, avgTime: 55, complicationRate: 2.9 },
  ]

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="space-y-6">
      {/* Top level metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.4%</div>
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
            <CardTitle className="text-sm font-medium">Average Length of Stay</CardTitle>
            <ActivitySquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.8 days</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -0.5 days
              </span>{" "}
              vs. target
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Readmission Rate</CardTitle>
            <Stethoscope className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -1.8%
              </span>{" "}
              vs. previous year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mortality Rate</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.3%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -0.4%
              </span>{" "}
              vs. national average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Patient Outcomes by Month</CardTitle>
            <CardDescription>Percentage of patients with improved, stable, or deteriorated conditions</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={patientOutcomes}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Area type="monotone" dataKey="improved" name="Improved" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="stable" name="Stable" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area
                  type="monotone"
                  dataKey="deteriorated"
                  name="Deteriorated"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnosis Distribution</CardTitle>
            <CardDescription>Breakdown of diagnoses by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredDiagnoses}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 30,
                  left: 60,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Cases" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treatment Effectiveness</CardTitle>
            <CardDescription>Success rate by treatment type</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={treatmentEffectiveness}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="success"
                  nameKey="treatment"
                  label={({ treatment, success }) => `${treatment}: ${success}%`}
                >
                  {treatmentEffectiveness.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Readmission Rates Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Readmission Rates Trend</CardTitle>
          <CardDescription>Monthly readmission rates for the past year</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={readmissionRates}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 8]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line
                type="monotone"
                dataKey="rate"
                name="Readmission Rate"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Procedures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Common Procedures</CardTitle>
          <CardDescription>Details and statistics for frequently performed procedures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedure</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Avg. Time (min)</TableHead>
                  <TableHead className="text-right">Complication Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commonProcedures.map((procedure) => (
                  <TableRow key={procedure.procedure}>
                    <TableCell className="font-medium">{procedure.procedure}</TableCell>
                    <TableCell className="text-right">{procedure.count}</TableCell>
                    <TableCell className="text-right">{procedure.avgTime} min</TableCell>
                    <TableCell className="text-right">{procedure.complicationRate}%</TableCell>
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

