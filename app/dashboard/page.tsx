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
import { supabase } from "@/utils/supabase/client"
import { StatsCard } from "@/components/ui/stat-card"
import { usePatientData } from "@/hooks/use-patient"
import { useStatsData } from "@/hooks/use-stats"
import { useSupabaseRealtime } from "@/hooks/use-supabase-realtime"

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
                  <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                    <BarChart4 className="h-16 w-16 text-muted" />
                    <span className="ml-2 text-muted">Chart Placeholder</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Department Utilization</CardTitle>
                  <CardDescription>Current department capacity usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                    <Activity className="h-16 w-16 text-muted" />
                    <span className="ml-2 text-muted">Chart Placeholder</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Recently admitted or registered patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <Users className="h-16 w-16 text-muted" />
                  <span className="ml-2 text-muted">Patient Data Placeholder</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Scheduled appointments for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <Calendar className="h-16 w-16 text-muted" />
                  <span className="ml-2 text-muted">Appointment Data Placeholder</span>
                </div>
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
                <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <DollarSign className="h-16 w-16 text-muted" />
                  <span className="ml-2 text-muted">Financial Data Placeholder</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



