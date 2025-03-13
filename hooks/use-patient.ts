import { PatientFormValues } from './../components/patients/new-patient-form';
import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/utils/supabase/client"
import type { Patient } from "@/types/patients"
// Define the shape of database patient records for type mapping
interface DbPatient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  marital_status: string
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  phone: string
  email: string
  blood_type: string | null
  allergies: string[] | null
  current_medications: string | null
  past_surgeries: string | null
  chronic_conditions: string | null
  emergency_contact_name: string | null
  emergency_contact_relationship: string | null
  emergency_contact_phone: string | null
  insurance_provider: string | null
  insurance_id: string | null
  insurance_group_number: string | null
  created_at?: string
  [key: string]: any // Allow additional fields for flexibility
}

// Map database fields to our Patient interface
export const mapDbPatientToPatient = (dbRecord: any): Patient => {
  return {
    id: dbRecord.id,
    firstName: dbRecord.first_name,
    lastName: dbRecord.last_name,
    dateOfBirth: dbRecord.date_of_birth,
    gender: dbRecord.gender,
    maritalStatus: dbRecord.marital_status || "",
    address: dbRecord.address || "",
    city: dbRecord.city || "",
    state: dbRecord.state || "",
    zipCode: dbRecord.zip_code || "",
    phone: dbRecord.phone || "",
    email: dbRecord.email || "",
    bloodType: dbRecord.blood_type,
    allergies: dbRecord.allergies,
    currentMedications: dbRecord.current_medications,
    pastSurgeries: dbRecord.past_surgeries,
    chronicConditions: dbRecord.chronic_conditions,
    emergencyContactName: dbRecord.emergency_contact_name,
    emergencyContactRelationship: dbRecord.emergency_contact_relationship,
    emergencyContactPhone: dbRecord.emergency_contact_phone,
    insuranceProvider: dbRecord.insurance_provider,
    insuranceId: dbRecord.insurance_id,
    insuranceGroupNumber: dbRecord.insurance_group_number,
    groupNumber: dbRecord.groupNumber,
    policyHolderName: dbRecord.policyHolderName,
    relationshipToPatient: dbRecord.relationshipToPatient
  }
}

// Reverse mapping for sending data to Supabase
export const mapPatientToDbPatient = (patient: Patient): Omit<DbPatient, 'created_at'> => {
  return {
    id: patient.id,
    first_name: patient.firstName,
    last_name: patient.lastName,
    date_of_birth: patient.dateOfBirth,
    gender: patient.gender,
    marital_status: patient.maritalStatus,
    address: patient.address,
    city: patient.city,
    state: patient.state,
    zip_code: patient.zipCode,
    phone: patient.phone,
    email: patient.email,
    blood_type: patient.bloodType,
    allergies: patient.allergies,
    current_medications: patient.currentMedications,
    past_surgeries: patient.pastSurgeries,
    chronic_conditions: patient.chronicConditions,
    emergency_contact_name: patient.emergencyContactName,
    emergency_contact_relationship: patient.emergencyContactRelationship,
    emergency_contact_phone: patient.emergencyContactPhone,
    insurance_provider: patient.insuranceProvider,
    insurance_id: patient.insuranceId,
    insurance_group_number: patient.insuranceGroupNumber
  }
}

export interface PatientOperationResult {
  success?: boolean
  error?: any
}

export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  // Fetch patients data from Supabase
  const fetchPatients = useCallback(async (): Promise<PatientOperationResult> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (data) {
        // Map database records to our Patient type
        const mappedPatients = data.map(mapDbPatientToPatient)
        setPatients(mappedPatients)
      }
      
      return { success: true }
    } catch (err) {
      console.error("Error fetching patients:", err)
      setError(err)
      return { error: err }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new patient
  const createPatient = useCallback(async (patientData: PatientFormValues): Promise<PatientOperationResult> => {
    try {
      // Map form fields to database fields, ensuring required fields are present
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
        emergency_contact_address: patientData.contactAddress || null,

        // Insurance fields (only if hasInsurance is true)
        insurance_provider: patientData.hasInsurance ? patientData.insuranceProvider : null,
        insurance_id: patientData.hasInsurance ? patientData.insuranceId : null,
        insurance_group_number: patientData.hasInsurance ? patientData.groupNumber : null,
        policy_holder_name: patientData.hasInsurance ? patientData.policyHolderName : null,
        relationship_to_patient: patientData.hasInsurance ? patientData.relationshipToPatient : null,
      };

      const { data, error } = await supabase
        .from('patients')
        .insert(dbPatient)
        .select();

      if (error) throw error;

      return { success: true }
    } catch (err) {
      console.error("Error creating patient:", err)
      return { error: err }
    }
  }, [])

  // Update an existing patient
  const updatePatient = useCallback(async (updatedPatient: Patient): Promise<PatientOperationResult> => {
    try {
      const dbPatient = mapPatientToDbPatient(updatedPatient)
      
      const { error } = await supabase
        .from('patients')
        .update(dbPatient)
        .eq('id', updatedPatient.id)
      
      if (error) throw error
      
      // Optimistically update UI (the real-time subscription will sync eventually)
      setPatients(prevPatients => 
        prevPatients.map(p => p.id === updatedPatient.id ? updatedPatient : p)
      )
      
      return { success: true }
    } catch (err) {
      console.error("Error updating patient:", err)
      return { error: err }
    }
  }, [])

  // Delete a patient
  const deletePatient = useCallback(async (patientId: string): Promise<PatientOperationResult> => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)
      
      if (error) throw error
      
      // Optimistically update UI (the real-time subscription will sync eventually)
      setPatients(prevPatients => 
        prevPatients.filter(p => p.id !== patientId)
      )
      
      return { success: true }
    } catch (err) {
      console.error("Error deleting patient:", err)
      return { error: err }
    }
  }, [])

  // Handle real-time database changes
  // This function is exposed for external use like in the dashboard component
  // although it's also used internally with the Supabase subscription
  const handlePatientChange = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newPatient = mapDbPatientToPatient(payload.new)
      setPatients(prevPatients => [newPatient, ...prevPatients])
    } else if (payload.eventType === 'UPDATE') {
      const updatedPatient = mapDbPatientToPatient(payload.new)
      setPatients(prevPatients => 
        prevPatients.map(patient => 
          patient.id === updatedPatient.id ? updatedPatient : patient
        )
      )
    } else if (payload.eventType === 'DELETE') {
      setPatients(prevPatients => 
        prevPatients.filter(patient => patient.id !== payload.old.id)
      )
    }
  }, [])

  // Set up real-time database changes
  useEffect(() => {
    // Initial data fetch
    fetchPatients()

    // Set up real-time subscription
    const channel = supabase
      .channel('patients-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'patients' }, 
          handlePatientChange)
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPatients, handlePatientChange])

  return {
    patients,
    isLoading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    handlePatientChange
  }
}