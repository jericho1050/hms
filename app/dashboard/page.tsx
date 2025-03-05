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

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    patientCount: 0,
    appointmentsToday: 0,
    staffCount: 0,
    revenueThisMonth: 0,
    bedOccupancy: 0,
    inventoryItems: 0,
  })

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // In a real application, you'd fetch data from Supabase here
        // These are dummy values for demonstration
        setStats({
          patientCount: 1248,
          appointmentsToday: 42,
          staffCount: 64,
          revenueThisMonth: 128750,
          bedOccupancy: 72,
          inventoryItems: 864,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
            trend="+5.2%"
            trendDirection="up"
          />
          <StatsCard
            title="Today's Appointments"
            value={stats.appointmentsToday.toString()}
            description="Scheduled for today"
            icon={<Calendar className="h-5 w-5 text-indigo-500" />}
            trend="+12%"
            trendDirection="up"
          />
          <StatsCard
            title="Staff Members"
            value={stats.staffCount.toString()}
            description="Doctors, nurses & staff"
            icon={<HeartPulse className="h-5 w-5 text-red-500" />}
            trend="No change"
            trendDirection="neutral"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats.revenueThisMonth.toLocaleString()}`}
            description="This month"
            icon={<DollarSign className="h-5 w-5 text-green-500" />}
            trend="+8.3%"
            trendDirection="up"
          />
          <StatsCard
            title="Bed Occupancy"
            value={`${stats.bedOccupancy}%`}
            description="Current utilization"
            icon={<Bed className="h-5 w-5 text-orange-500" />}
            trend="-3.1%"
            trendDirection="down"
          />
          <StatsCard
            title="Inventory Items"
            value={stats.inventoryItems.toString()}
            description="Items in stock"
            icon={<Pill className="h-5 w-5 text-purple-500" />}
            trend="+2.4%"
            trendDirection="up"
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

function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendDirection,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend: string
  trendDirection: "up" | "down" | "neutral"
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center gap-1 text-xs">
          {trendDirection === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
          {trendDirection === "down" && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
          <span
            className={
              trendDirection === "up"
                ? "text-green-500"
                : trendDirection === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
            }
          >
            {trend}
          </span>
          <span className="text-muted-foreground ml-1">vs. last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

