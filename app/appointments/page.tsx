'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarIcon,
  List,
  PlusCircle,
  Users,
  CheckCircle,
  XCircle,
  Filter,
  Loader2,
} from 'lucide-react';
import { AppointmentList } from '@/components/appointments/appointment-list';
import { DailySchedule } from '@/components/appointments/daily-schedule';
import { NewAppointmentForm } from '@/components/appointments/new-appointment-form';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { useAppointmentPage } from '@/hooks/use-appointment-page';

export default function AppointmentsPage() {
  const {
    // Loading state
    isLoading,

    // Calendar state and controls
    selectedDate,
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    handleDateSelect,

    // Appointment data and operations
    appointments,
    filteredAppointments,
    stats,
    handleStatusChange,
    handleNewAppointment,
    getAppointmentsForDate,

    // Filter state and operations
    filters,
    setters,
    resetFilters,
    getFilters,

    // Dialog controls
    newAppointmentDialog
  } = useAppointmentPage();

  const appointmentsForSelectedDate = getAppointmentsForDate(selectedDate);
  const { departments, doctors } = getFilters();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[calc(100vh-4rem)]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 md:p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Appointment Management
          </h1>
          <p className='text-muted-foreground'>
            Manage and schedule patient appointments
          </p>
        </div>
        <Button onClick={newAppointmentDialog.open} className='gap-2'>
          <PlusCircle className='h-4 w-4' />
          New Appointment
        </Button>
      </div>

      {/* Stats Section */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Today</CardTitle>
            <CalendarIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalToday}</div>
            <p className='text-xs text-muted-foreground'>
              Appointments scheduled for today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <CheckCircle className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.completed}</div>
            <p className='text-xs text-muted-foreground'>
              Appointments completed today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>No-Shows</CardTitle>
            <XCircle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.noShows}</div>
            <p className='text-xs text-muted-foreground'>
              Patients who didn't show up
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            <Users className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.pending}</div>
            <p className='text-xs text-muted-foreground'>
              Appointments waiting to be seen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-col md:flex-row gap-4 items-start md:items-center'>
        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Filters:</span>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full'>
          <Select value={filters.departmentFilter} onValueChange={setters.setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder='Department' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department} value={department.toLowerCase()}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.doctorFilter} onValueChange={setters.setDoctorFilter}>
            <SelectTrigger>
              <SelectValue placeholder='Doctor' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Doctors</SelectItem>
              {doctors.map((doctorId) => {
                const doctor = appointments.find(
                  (a) => a.doctorId === doctorId
                );
                return (
                  <SelectItem key={doctorId} value={doctorId}>
                    {doctor?.doctorName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={filters.statusFilter} onValueChange={setters.setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='scheduled'>Scheduled</SelectItem>
              <SelectItem value='checked-in'>Checked In</SelectItem>
              <SelectItem value='in-progress'>In Progress</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
              <SelectItem value='cancelled'>Cancelled</SelectItem>
              <SelectItem value='no-show'>No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* New Layout: Side-by-Side Calendar and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Calendar Panel */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-2">
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Filters Panel */}
              <div className="space-y-4 mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </h3>
                <Select value={filters.departmentFilter} onValueChange={setters.setDepartmentFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Departments</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department.toLowerCase()}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.doctorFilter} onValueChange={setters.setDoctorFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Doctors</SelectItem>
                    {doctors.map((doctorId) => {
                      const doctor = appointments.find(
                        (a) => a.doctorId === doctorId
                      );
                      return (
                        <SelectItem key={doctorId} value={doctorId}>
                          {doctor?.doctorName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Select value={filters.statusFilter} onValueChange={setters.setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value='scheduled'>Scheduled</SelectItem>
                    <SelectItem value='checked-in'>Checked In</SelectItem>
                    <SelectItem value='in-progress'>In Progress</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                    <SelectItem value='no-show'>No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Full-size Calendar Component */}
              <AppointmentCalendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                appointments={filteredAppointments}
                className="border-0"
                disableWeekends={true}
                minDate={new Date()} // Prevent selecting dates in the past
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right: Appointment Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-muted/50 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {appointmentsForSelectedDate.length} appointments
                </p>
              </div>
              <Button onClick={newAppointmentDialog.open}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue='daily' className='w-full'>
                <TabsList className='grid w-full grid-cols-2 mb-4'>
                  <TabsTrigger value='daily'>
                    <CalendarIcon className='h-4 w-4 mr-2' />
                    Daily View
                  </TabsTrigger>
                  <TabsTrigger value='list'>
                    <List className='h-4 w-4 mr-2' />
                    List View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='daily'>
                  <DailySchedule
                    appointments={appointmentsForSelectedDate}
                    date={selectedDate}
                    onStatusChange={handleStatusChange}
                  />
                </TabsContent>

                <TabsContent value='list'>
                  <AppointmentList
                    appointments={filteredAppointments}
                    onStatusChange={handleStatusChange}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Appointment Modal */}
      <NewAppointmentForm
        isOpen={newAppointmentDialog.isOpen}
        onClose={newAppointmentDialog.close}
        onSubmit={handleNewAppointment}
        departments={departments}
        doctors={appointments.map((a) => ({
          id: a.doctorId,
          name: a.doctorName,
        }))}
      />
    </div>
  );
}
