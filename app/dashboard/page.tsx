"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Calendar,
  Activity,
  DollarSign,
  Bed,
  HeartPulse,
  Pill,
  TrendingUp,
  BarChart4,
  Loader2,
} from "lucide-react"
import { StatsCard } from "@/components/ui/stat-card"
import { usePatientData } from "@/hooks/use-patient"
import { useStatsData } from "@/hooks/use-stats"
import { useSupabaseRealtime } from "@/hooks/use-supabase-realtime"
import { ChartContainer } from '@/components/ui/chart';
import * as RechartsPrimitive from 'recharts';

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

export default function Dashboard() {
  // Load patient data with custom hook
  const { patients, fetchPatients, handlePatientChange } = usePatientData()
  
  // Load stats data with custom hook
  const { 
    loading, 
    stats, 
    fetchDashboardData, 
    fetchDashboardMetrics,
    fetchMedicalRecordsCount,
    fetchBillingCount,
    fetchDepartmentsCount,
    fetchRoomsData
  } = useStatsData()
  
  // Set up effect to initialize data
  useEffect(() => {
    // Fetch initial data
    fetchDashboardData()
    fetchPatients()
  }, [fetchDashboardData, fetchPatients])
  
  // Set up real-time subscriptions using the custom hook
  useSupabaseRealtime('patients', (payload) => {
    fetchDashboardMetrics()
    handlePatientChange(payload)
  })
  
  useSupabaseRealtime('appointments', () => fetchDashboardMetrics())
  useSupabaseRealtime('staff', () => fetchDashboardMetrics())
  useSupabaseRealtime('medical_records', () => fetchMedicalRecordsCount())
  useSupabaseRealtime('inventory', () => fetchDashboardMetrics())
  useSupabaseRealtime('billing', () => {
    fetchBillingCount()
    fetchDashboardMetrics()
  })
  useSupabaseRealtime('departments', () => fetchDepartmentsCount())
  useSupabaseRealtime('rooms', () => fetchRoomsData())

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }


  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the hospital management system dashboard.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Patients"
            value={stats.patientCount.toLocaleString()}
            description="Registered patients"
            icon={<Users className="h-5 w-5 text-blue-500" />}
            trend={stats.trends.patientCount}
            trendDirection={stats.trendDirections.patientCount}
          />
          <StatsCard
            title="Today's Appointments"
            value={stats.appointmentsToday.toString()}
            description="Scheduled for today"
            icon={<Calendar className="h-5 w-5 text-indigo-500" />}
            trend={stats.trends.appointmentsToday}
            trendDirection={stats.trendDirections.appointmentsToday}
          />
          <StatsCard
            title="Staff Members"
            value={stats.staffCount.toString()}
            description="Doctors, nurses & staff"
            icon={<HeartPulse className="h-5 w-5 text-red-500" />}
            trend={stats.trends.staffCount}
            trendDirection={stats.trendDirections.staffCount}
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats.revenueThisMonth.toLocaleString()}`}
            description="This month"
            icon={<DollarSign className="h-5 w-5 text-green-500" />}
            trend={stats.trends.revenueThisMonth}
            trendDirection={stats.trendDirections.revenueThisMonth}
          />
          <StatsCard
            title="Bed Occupancy"
            value={`${stats.bedOccupancy}%`}
            description="Current utilization"
            icon={<Bed className="h-5 w-5 text-orange-500" />}
            trend={stats.trends.bedOccupancy}
            trendDirection={stats.trendDirections.bedOccupancy}
          />
          <StatsCard
            title="Inventory Items"
            value={stats.inventoryItems.toString()}
            description="Items in stock"
            icon={<Pill className="h-5 w-5 text-purple-500" />}
            trend={stats.trends.inventoryItems}
            trendDirection={stats.trendDirections.inventoryItems}
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Patient Admissions</CardTitle>
                  <CardDescription>Patient admissions over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ /* your chart config here */ }}>
                    <RechartsPrimitive.LineChart data={data}>
                      <RechartsPrimitive.XAxis dataKey="name" />
                      <RechartsPrimitive.YAxis />
                      <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                      <RechartsPrimitive.Tooltip />
                      <RechartsPrimitive.Legend />
                      <RechartsPrimitive.Line type="monotone" dataKey="pv" stroke="#8884d8" />
                      <RechartsPrimitive.Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                    </RechartsPrimitive.LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Department Utilization</CardTitle>
                  <CardDescription>Current department capacity usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ /* your chart config here */ }}>
                    <RechartsPrimitive.LineChart data={data}>
                      <RechartsPrimitive.XAxis dataKey="name" />
                      <RechartsPrimitive.YAxis />
                      <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                      <RechartsPrimitive.Tooltip />
                      <RechartsPrimitive.Legend />
                      <RechartsPrimitive.Line type="monotone" dataKey="pv" stroke="#8884d8" />
                      <RechartsPrimitive.Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                    </RechartsPrimitive.LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Patient demographics and distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ 
                  "male": { color: "#3b82f6" }, 
                  "female": { color: "#ec4899" },
                  "other": { color: "#a855f7" }
                }}>
                  <RechartsPrimitive.BarChart data={data}>
                    <RechartsPrimitive.XAxis dataKey="name" />
                    <RechartsPrimitive.YAxis />
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                    <RechartsPrimitive.Tooltip />
                    <RechartsPrimitive.Legend />
                    <RechartsPrimitive.Bar dataKey="pv" name="Male" fill="#3b82f6" />
                    <RechartsPrimitive.Bar dataKey="uv" name="Female" fill="#ec4899" />
                  </RechartsPrimitive.BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Distribution</CardTitle>
                <CardDescription>Distribution by department and type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  "emergency": { color: "#ef4444" },
                  "scheduled": { color: "#3b82f6" },
                  "followup": { color: "#22c55e" },
                  "consultation": { color: "#f59e0b" }
                }}>
                  <RechartsPrimitive.PieChart>
                    <RechartsPrimitive.Pie
                      data={[
                        { name: 'Emergency', value: 400 },
                        { name: 'Scheduled', value: 300 },
                        { name: 'Follow-up', value: 300 },
                        { name: 'Consultation', value: 200 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {
                        [
                          { name: 'Emergency', fill: '#ef4444' },
                          { name: 'Scheduled', fill: '#3b82f6' },
                          { name: 'Follow-up', fill: '#22c55e' },
                          { name: 'Consultation', fill: '#f59e0b' }
                        ].map((entry, index) => (
                          <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                        ))
                      }
                    </RechartsPrimitive.Pie>
                    <RechartsPrimitive.Tooltip />
                    <RechartsPrimitive.Legend />
                  </RechartsPrimitive.PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Revenue and expenses for the current period</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  "revenue": { color: "#22c55e" },
                  "expenses": { color: "#ef4444" },
                  "profit": { color: "#3b82f6" }
                }}>
                  <RechartsPrimitive.AreaChart data={[
                    { month: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
                    { month: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
                    { month: 'Mar', revenue: 2000, expenses: 1800, profit: 200 },
                    { month: 'Apr', revenue: 2780, expenses: 1908, profit: 872 },
                    { month: 'May', revenue: 1890, expenses: 1800, profit: 90 },
                    { month: 'Jun', revenue: 2390, expenses: 1800, profit: 590 },
                    { month: 'Jul', revenue: 3490, expenses: 2300, profit: 1190 }
                  ]}>
                    <RechartsPrimitive.XAxis dataKey="month" />
                    <RechartsPrimitive.YAxis />
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                    <RechartsPrimitive.Tooltip />
                    <RechartsPrimitive.Legend />
                    <RechartsPrimitive.Area type="monotone" dataKey="revenue" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                    <RechartsPrimitive.Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <RechartsPrimitive.Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </RechartsPrimitive.AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



