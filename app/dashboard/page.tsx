'use client';

import type React from 'react';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/ui/stat-card';
import { usePatientData } from '@/hooks/use-patient';
import { useStatsData } from '@/hooks/use-stats';
import { useSupabaseRealtime } from '@/hooks/use-supabase-realtime';
import * as RechartsPrimitive from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@/components/ui/chart';
import {
  Users,
  Calendar,
  DollarSign,
  Bed,
  HeartPulse,
  Pill,
  TrendingUp,
  Loader2,
  Plus,
  Search,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  recentPatientsData,
  upcomingAppointmentsData,
  financialMetricsData,
  departmentFinancialsData,
  appointmentsByDepartmentData,
  appointmentsByTypeData,
} from '@/lib/mock-dashboard-charts';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/utils/supabase/client';
import { Patient } from '@/types/patients';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { mapDbPatientToPatient } from '../actions/utils';
import { Pie, PieChart, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAppointments } from '@/hooks/use-appointments';
import type { Appointment } from '@/types/appointments';

export default function Dashboard() {
  // Load patient data with custom hook
  const {
    patientAdmissionsData,
    fetchPatientAdmissions,
    handlePatientChange,
  } = usePatientData();

  // Add useAppointments hook
  const {
    appointments,
    fetchAppointments,
    getAppointmentsForDate,
  } = useAppointments();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const { resolvedTheme } = useTheme();
  
  // Add state for appointment charts
  const [appointmentsByDept, setAppointmentsByDept] = useState<{ department: string; count: number }[]>([]);
  const [appointmentsByType, setAppointmentsByType] = useState<{ type: string; value: number }[]>([]);

  // Add a new state for upcoming appointments
  const [upcomingAppointmentsData, setUpcomingAppointmentsData] = useState<Appointment[]>([]);

  const tooltipStyle = {
    backgroundColor: resolvedTheme === 'dark' ? '#2D3748' : '#ffffff',
    color: resolvedTheme === 'dark' ? '#fff' : '#000',
    border: 'none',
  };

  // Load stats data with custom hook
  const {
    loading,
    stats,
    departmentUtilizationData,
    fetchDashboardData,
    fetchDashboardMetrics,
    fetchMedicalRecordsCount,
    fetchBillingCount,
    fetchDepartmentsCount,
    fetchRoomsData,
    fetchDepartmentUtilization,
  } = useStatsData();

  // Fetch recent patients using server-side pagination
  const fetchRecentPatients = async () => {
    try {
      setIsLoadingPatients(true);
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, 9); // Get the 10 most recent patients (0-9 is 10 items)
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Map database records to our Patient type
        const mappedPatients = data.map(dbRecord => mapDbPatientToPatient(dbRecord));
        setRecentPatients(mappedPatients);
      }
    } catch (error) {
      console.error('Error fetching recent patients:', error);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Add a function to calculate appointment distribution
  const calculateAppointmentDistribution = useCallback(() => {
    if (!appointments.length) return;

    // Count by department
    const deptCounts: Record<string, number> = {};
    appointments.forEach(app => {
      const dept = app.department || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    // Convert to chart data format
    const deptData = Object.entries(deptCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    setAppointmentsByDept(deptData);

    // Count by type
    const typeCounts: Record<string, number> = {};
    appointments.forEach(app => {
      const type = app.type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Convert to chart data format
    const typeData = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, value: count }))
      .sort((a, b) => b.value - a.value);

    setAppointmentsByType(typeData);
  }, [appointments]);

  // Add a function to get upcoming appointments
  const getUpcomingAppointments = useCallback(() => {
    if (!appointments.length) return;
    
    // Get current date
    const today = new Date();
    
    // Get end date (7 days from now)
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    // Filter appointments that are within the next 7 days
    const upcoming = appointments.filter(app => {
      const appDate = parseISO(app.date);
      return appDate >= today && appDate <= nextWeek;
    });
    
    // Sort by date and time
    const sorted = [...upcoming].sort((a, b) => {
      // First sort by date
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;
      
      // Then by time
      return a.startTime.localeCompare(b.startTime);
    });
    
    // Limit to 5 appointments for display
    setUpcomingAppointmentsData(sorted.slice(0, 5));
  }, [appointments]);

  // Set up effect to initialize data
  useEffect(() => {
    // Fetch initial data
    fetchDashboardData();
    fetchRecentPatients();
    fetchPatientAdmissions();
    fetchAppointments();
  }, [fetchDashboardData, fetchPatientAdmissions, fetchAppointments]);

  // Calculate appointment distributions when appointments change
  useEffect(() => {
    calculateAppointmentDistribution();
    getUpcomingAppointments();
  }, [appointments, calculateAppointmentDistribution, getUpcomingAppointments]);

  // Set up real-time subscriptions using the custom hook
  useSupabaseRealtime('patients', (payload) => {
    fetchDashboardMetrics();
    fetchPatientAdmissions();
    handlePatientChange(payload);
    fetchRecentPatients(); // Re-fetch recent patients when patients table changes
  });

  useSupabaseRealtime('appointments', () => {
    fetchDashboardMetrics();
    fetchAppointments(); // Re-fetch appointments when the appointments table changes
  });
  useSupabaseRealtime('staff', () => fetchDashboardMetrics());
  useSupabaseRealtime('medical_records', () => fetchMedicalRecordsCount());
  useSupabaseRealtime('inventory', () => fetchDashboardMetrics());
  useSupabaseRealtime('billing', () => {
    fetchBillingCount();
    fetchDashboardMetrics();
  });
  useSupabaseRealtime('departments', () => {
    fetchDepartmentsCount();
    fetchDepartmentUtilization();
  });
  useSupabaseRealtime('rooms', () => {
    fetchRoomsData();
    fetchDepartmentUtilization();
  });

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[calc(100vh-4rem)]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  // Filter the recent patients based on search term
  const filteredPatients = recentPatients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='container mx-auto p-4 md:p-6'>
      <div className='flex flex-col space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Welcome to the hospital management system dashboard.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <StatsCard
            title='Total Patients'
            value={stats.patientCount.toLocaleString()}
            description='Registered patients'
            icon={<Users className='h-5 w-5 text-blue-500' />}
            trend={stats.trends.patientCount}
            trendDirection={stats.trendDirections.patientCount}
          />
          <StatsCard
            title="Today's Appointments"
            value={stats.appointmentsToday.toString()}
            description='Scheduled for today'
            icon={<Calendar className='h-5 w-5 text-indigo-500' />}
            trend={stats.trends.appointmentsToday}
            trendDirection={stats.trendDirections.appointmentsToday}
          />
          <StatsCard
            title='Staff Members'
            value={stats.staffCount.toString()}
            description='Doctors, nurses & staff'
            icon={<HeartPulse className='h-5 w-5 text-red-500' />}
            trend={stats.trends.staffCount}
            trendDirection={stats.trendDirections.staffCount}
          />
          <StatsCard
            title='Monthly Revenue'
            value={`$${stats.revenueThisMonth.toLocaleString()}`}
            description='This month'
            icon={<DollarSign className='h-5 w-5 text-green-500' />}
            trend={stats.trends.revenueThisMonth}
            trendDirection={stats.trendDirections.revenueThisMonth}
          />
          <StatsCard
            title='Bed Occupancy'
            value={`${stats.bedOccupancy}%`}
            description='Current utilization'
            icon={<Bed className='h-5 w-5 text-orange-500' />}
            trend={stats.trends.bedOccupancy}
            trendDirection={stats.trendDirections.bedOccupancy}
          />
          <StatsCard
            title='Inventory Items'
            value={stats.inventoryItems.toString()}
            description='Items in stock'
            icon={<Pill className='h-5 w-5 text-purple-500' />}
            trend={stats.trends.inventoryItems}
            trendDirection={stats.trendDirections.inventoryItems}
          />
        </div>

        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='grid w-full md:w-auto grid-cols-2 md:grid-cols-4'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='patients'>Patients</TabsTrigger>
            <TabsTrigger value='appointments'>Appointments</TabsTrigger>
            <TabsTrigger value='financials'>Financials</TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
              <Card className='lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Patient Admissions</CardTitle>
                  <CardDescription>
                    Patient admissions over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={patientAdmissionsData}>
                      <XAxis
                        dataKey='date'
                        tickFormatter={(value) =>
                          new Date(value).getDate().toString()
                        }
                      />
                      <YAxis />
                      <Tooltip contentStyle={tooltipStyle} />                       <Bar
                        dataKey='admissions'
                        fill='hsl(var(--primary))'
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart> 
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className='lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Department Utilization</CardTitle>
                  <CardDescription>
                    Current department capacity usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={departmentUtilizationData}>
                      <XAxis dataKey='department' />
                      <YAxis />
                      <Tooltip contentStyle={tooltipStyle} />                       <Line
                        type='monotone'
                        dataKey='capacity'
                        stroke='hsl(var(--primary))'
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='patients'>
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>
                  Recently admitted or registered patients
                </CardDescription>
                <div className='flex justify-between items-center'>
                  <div className='flex w-full max-w-sm items-center space-x-2'>
                    <Input
                      placeholder='Search patients...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='max-w-xs'
                    />
                    <Button size='icon'>
                      <Search className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Date Of Birth</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPatients ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <p>Loading patients...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>{patient.firstName}</TableCell>
                          <TableCell>{patient.lastName}</TableCell>
                          <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                patient.status === 'Admitted'
                                  ? 'admitted'
                                  : patient.status === 'Discharged'
                                  ? 'discharged'
                                  : 'outpatient'
                              }
                              className='capitalize'
                            >
                              {patient.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{patient.phone}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p>No patients found</p>
                            <p className="text-sm">Try adjusting your search</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <div className="mt-4 flex justify-end">
                  <Link href="/patients">
                    <Button variant="outline" className="text-sm flex items-center gap-1">
                      View All Patients <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='appointments'>
            <Card>
              <CardHeader>
                <CardTitle>Appointment Distribution</CardTitle>
                <CardDescription>
                  Distribution by department and type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
                  <div className='lg:col-span-3'>
                    <ResponsiveContainer width='100%' height={300}>
                      <BarChart data={appointmentsByDept.length > 0 
                        ? appointmentsByDept
                        : stats.appointmentsByDepartment.length > 0 
                          ? stats.appointmentsByDepartment 
                          : appointmentsByDepartmentData}>
                        <XAxis dataKey='department' />
                        <YAxis />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey='count' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='lg:col-span-4'>
                    <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                    <Pie
                      data={appointmentsByType.length > 0 
                        ? appointmentsByType
                        : stats.appointmentsByType.length > 0 
                          ? stats.appointmentsByType 
                          : appointmentsByTypeData}
                      cx='50%'
                      cy='50%'
                      labelLine={true}
                      outerRadius={80}
                      fill='hsl(var(--primary))'
                      dataKey='value'
                      nameKey='type'
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      stroke={resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff'}
                      strokeWidth={2}
                    >
                      {stats.appointmentsByType?.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(${index * 40}, 70%, 50%)`} 
                          stroke={resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className='mt-8'>
                  <div className='flex justify-between items-center mb-4'>
                    <div>
                      <CardTitle>Upcoming Appointments</CardTitle>
                      <CardDescription>
                        Scheduled appointments for the next 7 days
                      </CardDescription>
                    </div>
                    <Link href="/appointments">
                      <Button>
                        <Plus className='mr-2 h-4 w-4' /> New Appointment
                      </Button>
                    </Link>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead className="hidden md:table-cell">Department</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingAppointmentsData.length > 0 ? (
                        upcomingAppointmentsData.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="font-medium">{format(parseISO(appointment.date), "MMM d")}</div>
                              <div className="text-xs text-muted-foreground">
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                            </TableCell>
                            <TableCell>{appointment.patientName}</TableCell>
                            <TableCell>Dr. {appointment.doctorName}</TableCell>
                            <TableCell className="hidden md:table-cell">{appointment.department}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  appointment.status === 'completed'
                                    ? 'default'
                                    : appointment.status === 'cancelled' || appointment.status === 'no-show'
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {appointment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No upcoming appointments</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 flex justify-end">
                    <Link href="/appointments">
                      <Button variant="outline" className="text-sm flex items-center gap-1">
                        View All Appointments <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='financials'>
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                  Revenue and expenses for the current period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
                  <div className="lg:col-span-3">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={financialMetricsData.revenueData || []}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" />
                        <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="lg:col-span-4">
                    <h3 className="text-lg font-medium mb-4">Financial Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span>Total Revenue</span>
                        <span className="font-bold text-green-600">${financialMetricsData.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span>Total Expenses</span>
                        <span className="font-medium text-destructive">${financialMetricsData.totalExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span>Net Profit</span>
                        <span className="font-bold text-green-700">${financialMetricsData.netProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span>Profit Margin</span>
                        <span className="font-medium">
                          {(financialMetricsData.netProfit / financialMetricsData.totalRevenue * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-medium mb-4">Department Financial Performance</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentFinancialsData.map((dept) => (
                      <TableRow key={dept.department}>
                        <TableCell>{dept.department}</TableCell>
                        <TableCell className="text-right">${dept.revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${dept.expenses.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ${dept.profit.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {(dept.profit / dept.revenue * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
