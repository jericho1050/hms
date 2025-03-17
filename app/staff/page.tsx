'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlusCircle,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { StaffAvailability } from '@/components/staff/staff-availability';
import { NewStaffForm } from '@/components/staff/new-staff-form';
import { useStaffData } from '@/hooks/use-staff';
import { StandaloneStaffDirectory } from '@/components/staff/staff-directory';

export default function StaffManagementPage() {
  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false);

  // Use the custom hook to get global staff stats
  const {
    stats,
    departments,
    roles,
    isLoading,
    staffData,
    filteredStaff,
    filterStaff,
    handleNewStaffSubmit,
  } = useStaffData();

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
            Staff Management
          </h1>
          <p className='text-muted-foreground'>
            Manage hospital staff, roles, and schedules
          </p>
        </div>
        <Button onClick={() => setIsNewStaffModalOpen(true)} className='gap-2'>
          <PlusCircle className='h-4 w-4' />
          Add New Staff
        </Button>
      </div>

      {/* Stats Section */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Staff</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalStaff}</div>
            <p className='text-xs text-muted-foreground'>Total staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Active Staff</CardTitle>
            <UserCheck className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.activeStaff}</div>
            <p className='text-xs text-muted-foreground'>
              Currently active staff members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Inactive Staff
            </CardTitle>
            <UserX className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.inactiveStaff}</div>
            <p className='text-xs text-muted-foreground'>
              Currently inactive staff members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Departments</CardTitle>
            <Briefcase className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{departments.length}</div>
            <p className='text-xs text-muted-foreground'>Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Department and Role Breakdown */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Staff by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {Object.entries(stats.departmentBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([department, count]) => (
                  <div
                    key={department}
                    className='flex items-center justify-between'
                  >
                    <span className='text-sm font-medium'>{department}</span>
                    <div className='flex items-center gap-2'>
                      <div className='w-32 h-2 bg-gray-100 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-primary'
                          style={{
                            width: `${(count / stats.totalStaff) * 100}%`,
                          }}
                        />
                      </div>
                      <span className='text-sm text-muted-foreground'>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Staff by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {Object.entries(stats.roleBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([role, count]) => (
                  <div key={role} className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>{role}</span>
                    <div className='flex items-center gap-2'>
                      <div className='w-32 h-2 bg-gray-100 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-primary'
                          style={{
                            width: `${(count / stats.totalStaff) * 100}%`,
                          }}
                        />
                      </div>
                      <span className='text-sm text-muted-foreground'>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue='directory' className='w-full'>
        <TabsList className='grid w-full md:w-auto grid-cols-2 md:grid-cols-2'>
          <TabsTrigger value='directory' className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Staff Directory
          </TabsTrigger>
          <TabsTrigger value='availability' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            Weekly Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value='directory' className='space-y-4'>
          {/* Using the standalone version that manages its own state */}
          <StandaloneStaffDirectory />
        </TabsContent>

        <TabsContent value='availability' className='space-y-4'>
          {/* This will still need staff data from the parent or its own hook */}
          <StaffAvailability/>
        </TabsContent>
      </Tabs>

      {/* New Staff Modal */}
      <NewStaffForm
        isOpen={isNewStaffModalOpen}
        onClose={() => setIsNewStaffModalOpen(false)}
        onSubmit={(data) => {
          if (
            data.firstName &&
            data.lastName &&
            data.status &&
            data.address &&
            data.phone &&
            data.email &&
            data.role &&
            data.department &&
            data.joiningDate
          ) {
            handleNewStaffSubmit({
              firstName: data.firstName,
              lastName: data.lastName,
              status: data.status,
              address: data.address,
              phone: data.phone,
              email: data.email,
              role: data.role,
              department: data.department,
              joiningDate: data.joiningDate,
              licenseNumber: data.licenseNumber,
              specialty: data.specialty,
              qualification: data.qualification,
            });
            setIsNewStaffModalOpen(false);
          } else {
            alert('Please fill in all required fields');
          }
        }}
        departments={departments}
        roles={roles}
      />
    </div>
  );
}

// Calendar icon component
function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect width='18' height='18' x='3' y='4' rx='2' ry='2' />
      <line x1='16' x2='16' y1='2' y2='6' />
      <line x1='8' x2='8' y1='2' y2='6' />
      <line x1='3' x2='21' y1='10' y2='10' />
    </svg>
  );
}
