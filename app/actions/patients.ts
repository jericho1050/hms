'use server';


import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import type { Patient } from "@/types/patients";
import { PatientFormValues } from "@/components/patients/new-patient-form";
import { mapPatientToDbPatient, mapDbPatientToPatient } from './utils';


export interface PatientOperationResult {
  success: boolean;
  error?: any;
  data?: any;
}

// Create a new patient
export async function createPatient(patientData: PatientFormValues): Promise<PatientOperationResult> {
  try {
    const supabase = await createClient();;
    
    // Map form fields to database fields
    const dbPatient = {
      // Required fields
      first_name: patientData.firstName,
      last_name: patientData.lastName,
      date_of_birth: patientData.dateOfBirth,
      gender: patientData.gender,
      address: patientData.address,
      phone: patientData.phone,
      email: patientData.email,
      
      // Optional fields
      marital_status: patientData.maritalStatus || null,
      city: patientData.city || null,
      state: patientData.state || null,
      zip_code: patientData.zipCode || null,
      blood_type: patientData.bloodType === 'unknown' ? null : patientData.bloodType,
      allergies: patientData.hasAllergies ? patientData.allergies : null,
      current_medications: patientData.currentMedications || null,
      past_surgeries: patientData.pastSurgeries || null,
      chronic_conditions: patientData.chronicConditions || null,
      
      // Emergency contact fields
      emergency_contact_name: patientData.contactName || null,
      emergency_contact_relationship: patientData.relationship || null,
      emergency_contact_phone: patientData.contactPhone || null,
      
      // Insurance fields (only if hasInsurance is true)
      insurance_provider: patientData.hasInsurance ? patientData.insuranceProvider : null,
      insurance_id: patientData.hasInsurance ? patientData.insuranceId : null,
      insurance_group_number: patientData.hasInsurance ? patientData.groupNumber : null,
      policy_holder_name: patientData.hasInsurance ? patientData.policyHolderName : null,
      relationship_to_patient: patientData.hasInsurance ? patientData.relationshipToPatient : null,
      
      // Status field
      status: patientData.status || 'Admitted',
    };

    const { data, error } = await supabase
      .from('patients')
      .insert(dbPatient)
      .select();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Server action error creating patient:", error);
    return { success: false, error };
  }
}

// Update an existing patient
export async function updatePatient(patient: Patient): Promise<PatientOperationResult> {
  try {
    const supabase = await createClient();;
    const dbPatient = mapPatientToDbPatient(patient);
    
    const { data, error } = await supabase
      .from('patients')
      .update(dbPatient)
      .eq('id', patient.id)
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Server action error updating patient:", error);
    return { success: false, error };
  }
}

// Delete a patient
export async function deletePatient(patientId: string): Promise<PatientOperationResult> {
  try {
    const supabase = await createClient();;
    
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Server action error deleting patient:", error);
    return { success: false, error };
  }
}

// Get paginated patients with filters
export async function getPaginatedPatients(
  page: number = 0,
  pageSize: number = 10,
  searchQuery?: string,
  genderFilter?: string,
  statusFilter?: string
): Promise<{
  patients: Patient[];
  totalCount: number;
  error?: any;
}> {
  try {
    const supabase = await createClient();;
    
    // Calculate range
    const start = page * pageSize;
    const end = start + pageSize - 1;
    
    // Start building the query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' });
    
    // Apply gender filter if not "all"
    if (genderFilter && genderFilter !== "all") {
      query = query.eq('gender', genderFilter.toLowerCase());
    }
    
    // Apply status filter if not "all"
    if (statusFilter && statusFilter !== "all") {
      query = query.eq('status', statusFilter);
    }
    
    // Apply search filter if provided
    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerms = `%${searchQuery.toLowerCase().trim()}%`;
      
      // Search across multiple columns with OR
      query = query.or(
        `first_name.ilike.${searchTerms},last_name.ilike.${searchTerms},email.ilike.${searchTerms}`
      );
    }
    
    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end);
    
    if (error) throw error;
    
    // Map database records to our Patient type
    const patients = data ? data.map(mapDbPatientToPatient) : [];
    
    return {
      patients,
      totalCount: count || 0,
      error: null
    };
  } catch (error) {
    console.error("Server action error fetching paginated patients:", error);
    return {
      patients: [],
      totalCount: 0,
      error
    };
  }
}