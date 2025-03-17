'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
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
} from '@/lib/mock-dashboard-charts';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/utils/supabase/client';
import { Patient } from '@/types/patients';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { mapDbPatientToPatient } from '../actions/utils';

export default function Dashboard() {
  // Load patient data with custom hook
  
  const {
    patientAdmissionsData,
    fetchPatientAdmissions,
    handlePatientChange,
  } = usePatientData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const { resolvedTheme } = useTheme();

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

  // Set up effect to initialize data
  useEffect(() => {
    // Fetch initial data
    fetchDashboardData();
    fetchRecentPatients();
    fetchPatientAdmissions();
  }, [fetchDashboardData, fetchPatientAdmissions]);

  // Set up real-time subscriptions using the custom hook
  useSupabaseRealtime('patients', (payload) => {
    fetchDashboardMetrics();
    fetchPatientAdmissions();
    handlePatientChange(payload);
    fetchRecentPatients(); // Re-fetch recent patients when patients table changes
  });

  useSupabaseRealtime('appointments', () => fetchDashboardMetrics());
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
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>
                      Scheduled appointments for the next 7 days
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className='mr-2 h-4 w-4' /> New Appointment
                  </Button>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppointmentsData.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {appointment.date} {appointment.time}
                        </TableCell>
                        <TableCell>{appointment.patientName}</TableCell>
                        <TableCell>{appointment.doctorName}</TableCell>
                        <TableCell>{appointment.department}</TableCell>
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
