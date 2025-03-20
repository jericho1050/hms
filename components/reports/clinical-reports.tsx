"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActivitySquare, TrendingUp, TrendingDown, Heart, Stethoscope, BarChartIcon, AlertTriangle } from "lucide-react"
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

interface ClinicalMetrics {
  patientsByAge?: Array<{
    age: string
    count: number
  }>
  patientsByGender?: Array<{
    gender: string
    count: number
  }>
  diagnosisFrequency?: Array<{
    name: string
    count: number
  }>
  treatmentOutcomes?: Array<{
    treatment: string
    success: number
    failure: number
  }>
  patientOutcomes?: Array<{
    month: string
    improved: number
    stable: number
    deteriorated: number
  }>
  readmissionRates?: Array<{
    month: string
    rate: number
  }>
  commonProcedures?: Array<{
    procedure: string
    count: number
    avgTime: number
    complicationRate: number
  }>
  patientSatisfaction?: {
    rate: number
    change: number
  }
  lengthOfStay?: {
    days: number
    change: number
  }
  readmissionRate?: {
    rate: number
    change: number
  }
  mortalityRate?: {
    rate: number
    change: number
  }
}

interface ClinicalReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  departmentFilter: string
  reportTypeFilter: string
  clinicalMetrics?: ClinicalMetrics
}

export function ClinicalReports({ 
  dateRange, 
  departmentFilter, 
  reportTypeFilter,
  clinicalMetrics 
}: ClinicalReportsProps) {
  // Check if we have real data to display
  const hasMetrics = clinicalMetrics !== undefined;
  const hasDiagnoses = !!clinicalMetrics?.diagnosisFrequency && clinicalMetrics.diagnosisFrequency.length > 0;
  const hasPatientOutcomes = !!clinicalMetrics?.patientOutcomes && clinicalMetrics.patientOutcomes.length > 0;
  const hasTreatmentOutcomes = !!clinicalMetrics?.treatmentOutcomes && clinicalMetrics.treatmentOutcomes.length > 0;
  const hasReadmissionRates = !!clinicalMetrics?.readmissionRates && clinicalMetrics.readmissionRates.length > 0;
  const hasCommonProcedures = !!clinicalMetrics?.commonProcedures && clinicalMetrics.commonProcedures.length > 0;
  const hasAgeDistribution = !!clinicalMetrics?.patientsByAge && clinicalMetrics.patientsByAge.length > 0;
  const hasGenderDistribution = !!clinicalMetrics?.patientsByGender && clinicalMetrics.patientsByGender.length > 0;

  // Filter diagnoses if available based on department filter
  const filteredDiagnoses = hasDiagnoses && clinicalMetrics && clinicalMetrics.diagnosisFrequency
    ? (departmentFilter === "all"
      ? clinicalMetrics.diagnosisFrequency
      : clinicalMetrics.diagnosisFrequency.filter((diag) => diag.name.toLowerCase().includes(departmentFilter.toLowerCase())))
    : [];

  // Format age distribution data if available
  const ageDistribution = hasAgeDistribution && clinicalMetrics && clinicalMetrics.patientsByAge
    ? clinicalMetrics.patientsByAge.map(item => ({ age: item.age, count: item.count }))
    : [];

  // Format gender distribution data if available
  const genderDistribution = hasGenderDistribution && clinicalMetrics && clinicalMetrics.patientsByGender
    ? clinicalMetrics.patientsByGender.map(item => ({ gender: item.gender, count: item.count }))
    : [];

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  if (!hasMetrics) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold">No clinical data available</h2>
        <p className="text-muted-foreground max-w-md">
          There is no clinical data available for the selected filters. Try changing your date range or department selection.
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
            <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicalMetrics.patientSatisfaction?.rate?.toFixed(1) || '-'}%</div>
            {clinicalMetrics.patientSatisfaction?.change && (
              <p className="text-xs text-muted-foreground">
                <span className={`${clinicalMetrics.patientSatisfaction.change >= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
                  {clinicalMetrics.patientSatisfaction.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {clinicalMetrics.patientSatisfaction.change >= 0 ? '+' : ''}
                  {clinicalMetrics.patientSatisfaction.change.toFixed(1)}%
                </span>{" "}
                vs. previous quarter
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Length of Stay</CardTitle>
            <ActivitySquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicalMetrics.lengthOfStay?.days?.toFixed(1) || '-'} days</div>
            {clinicalMetrics.lengthOfStay?.change && (
              <p className="text-xs text-muted-foreground">
                <span className={`${clinicalMetrics.lengthOfStay.change <= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
                  {clinicalMetrics.lengthOfStay.change <= 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {clinicalMetrics.lengthOfStay.change <= 0 ? '' : '+'}
                  {clinicalMetrics.lengthOfStay.change.toFixed(1)} days
                </span>{" "}
                vs. target
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Readmission Rate</CardTitle>
            <Stethoscope className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicalMetrics.readmissionRate?.rate?.toFixed(1) || '-'}%</div>
            {clinicalMetrics.readmissionRate?.change && (
              <p className="text-xs text-muted-foreground">
                <span className={`${clinicalMetrics.readmissionRate.change <= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
                  {clinicalMetrics.readmissionRate.change <= 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {clinicalMetrics.readmissionRate.change <= 0 ? '' : '+'}
                  {clinicalMetrics.readmissionRate.change.toFixed(1)}%
                </span>{" "}
                vs. previous year
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mortality Rate</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicalMetrics.mortalityRate?.rate?.toFixed(1) || '-'}%</div>
            {clinicalMetrics.mortalityRate?.change && (
              <p className="text-xs text-muted-foreground">
                <span className={`${clinicalMetrics.mortalityRate.change <= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
                  {clinicalMetrics.mortalityRate.change <= 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {clinicalMetrics.mortalityRate.change <= 0 ? '' : '+'}
                  {clinicalMetrics.mortalityRate.change.toFixed(1)}%
                </span>{" "}
                vs. national average
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Demographics */}
      <div className="grid gap-4 md:grid-cols-2">
        {hasAgeDistribution ? (
          <Card>
            <CardHeader>
              <CardTitle>Patient Age Distribution</CardTitle>
              <CardDescription>Breakdown of patients by age range</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageDistribution}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Patients" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Patient Age Distribution</CardTitle>
              <CardDescription>No age distribution data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No age distribution data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {hasGenderDistribution ? (
          <Card>
            <CardHeader>
              <CardTitle>Patient Gender Distribution</CardTitle>
              <CardDescription>Breakdown of patients by gender</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="gender"
                    label={({ gender, percent }) => `${gender}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} patients`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Patient Gender Distribution</CardTitle>
              <CardDescription>No gender distribution data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No gender distribution data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        {hasPatientOutcomes ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Patient Outcomes by Month</CardTitle>
              <CardDescription>Percentage of patients with improved, stable, or deteriorated conditions</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={clinicalMetrics.patientOutcomes}
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
        ) : (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Patient Outcomes by Month</CardTitle>
              <CardDescription>No patient outcomes data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No patient outcomes data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {hasDiagnoses ? (
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis Distribution</CardTitle>
              <CardDescription>No diagnosis data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No diagnosis distribution data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {hasTreatmentOutcomes ? (
          <Card>
            <CardHeader>
              <CardTitle>Treatment Effectiveness</CardTitle>
              <CardDescription>Success rate by treatment type</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clinicalMetrics.treatmentOutcomes}
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
                    {clinicalMetrics?.treatmentOutcomes?.map((entry, index) => (
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
              <CardTitle>Treatment Effectiveness</CardTitle>
              <CardDescription>No treatment outcomes data available</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No treatment effectiveness data available for the selected filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Readmission Rates Chart */}
      {hasReadmissionRates ? (
        <Card>
          <CardHeader>
            <CardTitle>Readmission Rates Trend</CardTitle>
            <CardDescription>Monthly readmission rates for the past year</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={clinicalMetrics.readmissionRates}
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Readmission Rates Trend</CardTitle>
            <CardDescription>No readmission data available</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-72">
            <p className="text-muted-foreground">No readmission rate data available for the selected filters.</p>
          </CardContent>
        </Card>
      )}

      {/* Procedures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Common Procedures</CardTitle>
          <CardDescription>Details and statistics for frequently performed procedures</CardDescription>
        </CardHeader>
        <CardContent>
          {hasCommonProcedures ? (
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
                  {clinicalMetrics?.commonProcedures?.map((procedure) => (
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
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No procedure data available for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

