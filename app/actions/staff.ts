'use server';

import { createClient } from '@/utils/supabase/server';
import type { Staff, StaffSchedule } from '@/types/staff';
import { StaffFormValues } from '@/components/staff/new-staff-form';


export async function addStaffMember(newStaffData: StaffFormValues) {
  const supabase = await createClient();

  const defaultAvailability = {
    recurring: {
      monday: 'on-call',
      tuesday: 'on-call',
      wednesday: 'on-call',
      thursday: 'on-call',
      friday: 'on-call',
      saturday: 'off',
      sunday: 'off',
    },
    overrides: {},
  };

  const newStaff = {
    first_name: newStaffData.firstName || '',
    last_name: newStaffData.lastName || '',
    role: newStaffData.role || '',
    department: newStaffData.department || '',
    email: newStaffData.email || '',
    contact_number: newStaffData.phone || '',
    address: newStaffData.address || '',
    joining_date:
      newStaffData.joiningDate || new Date().toISOString().split('T')[0],
    status: 'active',
    license_number: newStaffData.licenseNumber || '',
    specialty: newStaffData.specialty || '',
    qualification: newStaffData.qualification || '',
    availability: defaultAvailability,
  };

  const { data, error } = await supabase
    .from('staff')
    .insert(newStaff)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateStaffMember(
  updatedStaff: Staff,
  staffId: string
) {
  const supabase = await createClient();

  // Map Staff object to match database schema
  const dbStaff = {
    first_name: updatedStaff.firstName,
    last_name: updatedStaff.lastName,
    role: updatedStaff.role,
    department: updatedStaff.department,
    email: updatedStaff.email,
    contact_number: updatedStaff.phone,
    address: updatedStaff.address,
    joining_date: updatedStaff.joiningDate,
    status: updatedStaff.status,
    license_number: updatedStaff.licenseNumber,
    specialty: updatedStaff.specialty,
    qualification: updatedStaff.qualification,
    availability: updatedStaff.availability,
  };

  const { data, error } = await supabase
    .from('staff')
    .update(dbStaff)
    .eq('id', staffId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateStaffAvailability(
  staffId: string,
  availability: StaffSchedule
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('staff')
    .update({ availability })
    .eq('id', staffId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}