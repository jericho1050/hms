import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Calendar,
  Activity,
  DollarSign,
  Bed,
  HeartPulse,
  Pill,
  BarChart4,
} from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the hospital management system dashboard.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Skeleton Stats Cards */}
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
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
                  <Skeleton className="h-[200px] w-full rounded-md" />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Department Utilization</CardTitle>
                  <CardDescription>Current department capacity usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[200px] w-full rounded-md" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 