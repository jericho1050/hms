"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  List,
  PlusCircle,
  Users,
  CheckCircle,
  XCircle,
  Filter,
  Loader2,
} from "lucide-react"
import { AppointmentList } from "@/components/appointments/appointment-list"
import { DailySchedule } from "@/components/appointments/daily-schedule"
import { NewAppointmentForm } from "@/components/appointments/new-appointment-form"
import { mockAppointments } from "@/lib/mock-appointments"
import type { Appointment } from "@/types/appointments"

export default function AppointmentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [doctorFilter, setDoctorFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Stats for today
  const [stats, setStats] = useState({
    totalToday: 0,
    completed: 0,
    noShows: 0,
    pending: 0,
  })

  // Fetch appointments (mock data for now)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setAppointments(mockAppointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Filter appointments based on selected filters
  useEffect(() => {
    let filtered = [...appointments]

    // Filter by department
    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.department.toLowerCase() === departmentFilter.toLowerCase(),
      )
    }

    // Filter by doctor
    if (doctorFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.doctorId === doctorFilter)
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredAppointments(filtered)

    // Calculate stats for today
    const today = new Date()
    const todaysAppointments = appointments.filter((appointment) => isSameDay(parseISO(appointment.date), today))

    setStats({
      totalToday: todaysAppointments.length,
      completed: todaysAppointments.filter((a) => a.status === "completed").length,
      noShows: todaysAppointments.filter((a) => a.status === "no-show").length,
      pending: todaysAppointments.filter((a) => a.status === "scheduled").length,
    })
  }, [appointments, departmentFilter, doctorFilter, statusFilter])

  // Get unique departments and doctors for filters
  const departments = Array.from(new Set(appointments.map((a) => a.department)))
  const doctors = Array.from(new Set(appointments.map((a) => a.doctorId)))

  // Get appointments for the selected date
  const appointmentsForSelectedDate = filteredAppointments.filter((appointment) =>
    isSameDay(parseISO(appointment.date), selectedDate),
  )

  // Get appointments for the current week
  const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 0 })
  const endOfCurrentWeek = endOfWeek(currentWeek, { weekStartsOn: 0 })

  const appointmentsForCurrentWeek = filteredAppointments.filter((appointment) => {
    const appointmentDate = parseISO(appointment.date)
    return appointmentDate >= startOfCurrentWeek && appointmentDate <= endOfCurrentWeek
  })

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const goToToday = () => {
    setSelectedDate(new Date())
    setCurrentWeek(new Date())
  }

  // Handle appointment status changes
  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === appointmentId ? { ...appointment, status: newStatus } : appointment,
    )

    setAppointments(updatedAppointments)
  }

  // Handle new appointment creation
  const handleNewAppointment = (appointmentData: Partial<Appointment>) => {
    // In a real app, this would be an API call
    const newAppointment: Appointment = {
      id: `APP-${Math.floor(Math.random() * 10000)}`,
      patientId: appointmentData.patientId || "",
      patientName: appointmentData.patientName || "",
      doctorId: appointmentData.doctorId || "",
      doctorName: appointmentData.doctorName || "",
      department: appointmentData.department || "",
      date: appointmentData.date || new Date().toISOString(),
      startTime: appointmentData.startTime || "",
      endTime: appointmentData.endTime || "",
      status: "scheduled",
      type: appointmentData.type || "",
      notes: appointmentData.notes || "",
    }

    setAppointments([...appointments, newAppointment])
    setIsNewAppointmentModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Management</h1>
          <p className="text-muted-foreground">Manage and schedule patient appointments</p>
        </div>
        <Button onClick={() => setIsNewAppointmentModalOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Today</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalToday}</div>
            <p className="text-xs text-muted-foreground">Appointments scheduled for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Appointments completed today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">No-Shows</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noShows}</div>
            <p className="text-xs text-muted-foreground">Patients who didn't show up</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Appointments waiting to be seen</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department} value={department.toLowerCase()}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((doctorId) => {
                const doctor = appointments.find((a) => a.doctorId === doctorId)
                return (
                  <SelectItem key={doctorId} value={doctorId}>
                    {doctor?.doctorName}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-2 font-medium">
            {format(startOfCurrentWeek, "MMM d")} - {format(endOfCurrentWeek, "MMM d, yyyy")}
          </div>
        </div>
        <div className="flex items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-2">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Daily View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <DailySchedule
            appointments={appointmentsForSelectedDate}
            date={selectedDate}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <AppointmentList appointments={appointmentsForCurrentWeek} onStatusChange={handleStatusChange} />
        </TabsContent>
      </Tabs>

      {/* New Appointment Modal */}
      <NewAppointmentForm
        isOpen={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
        onSubmit={handleNewAppointment}
        departments={departments}
        doctors={appointments.map((a) => ({ id: a.doctorId, name: a.doctorName }))}
      />
    </div>
  )
}

