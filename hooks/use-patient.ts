import { PatientFormValues } from './../components/patients/new-patient-form';
import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/utils/supabase/client"
import type { Patient } from "@/types/patients"
// Import server actions for mutations
import {
  createPatient as createPatientAction,
  updatePatient as updatePatientAction,
  deletePatient as deletePatientAction,
} from "@/app/actions/patients"
import { mapDbPatientToPatient, mapPatientToDbPatient } from '@/app/actions/utils';

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
  status: string
  created_at?: string
  [key: string]: any // Allow additional fields for flexibility
}

// Define billing history interface
export interface BillingRecord {
  id: string
  invoice_date: string
  due_date: string | null
  total_amount: number
  payment_status: string
  payment_method: string | null
  payment_date: string | null
  services: any
  insurance_claim_id: string | null
  insurance_coverage: number | null
  discount: number | null
  tax: number | null
  notes: string | null
  created_at: string
}

export interface PatientOperationResult {
  success?: boolean
  error?: any
  data?: any
}

export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [patientAdmissionsData, setPatientAdmissionsData] = useState<{ date: string; admissions: number }[]>([])
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([])
  const [isBillingLoading, setIsBillingLoading] = useState(false)
  const [billingError, setBillingError] = useState<any>(null)

  // Fetch patients data from Supabase client-side
  // This will be used for initial data loading in client components
  // and will eventually be replaced by server components for initial fetching
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

  // Fetch billing history for a specific patient
  const fetchPatientBillingHistory = useCallback(async (patientId: string): Promise<PatientOperationResult> => {
    setIsBillingLoading(true)
    setBillingError(null)
    
    try {
      const { data, error } = await supabase
        .from('billing')
        .select('*')
        .eq('patient_id', patientId)
        .order('invoice_date', { ascending: false })
      
      if (error) throw error
      
      if (data) {
        setBillingHistory(data as BillingRecord[])
      } else {
        setBillingHistory([])
      }
      
      return { success: true, data }
    } catch (err) {
      console.error("Error fetching patient billing history:", err)
      setBillingError(err)
      return { error: err }
    } finally {
      setIsBillingLoading(false)
    }
  }, [])

  // Fetch patient admissions for the last 30 days
  const fetchPatientAdmissions = useCallback(async (): Promise<{ date: string; admissions: number }[]> => {
    try {
      // Calculate date range for last 30 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 29)
      
      // Format dates for Supabase query
      const startDateStr = startDate.toISOString()
      const endDateStr = endDate.toISOString()
      
      // Fetch patients created in the last 30 days
      const { data, error } = await supabase
        .from('patients')
        .select('created_at')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .order('created_at')
      
      if (error) throw error
      
      // Create a map of dates to count admissions per day
      const admissionsMap = new Map<string, number>()
      
      // Initialize all dates in the range with 0 admissions
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        admissionsMap.set(dateStr, 0)
      }
      
      // Count admissions for each day
      if (data) {
        data.forEach(patient => {
          const admissionDate = new Date(patient.created_at).toISOString().split('T')[0]
          const currentCount = admissionsMap.get(admissionDate) || 0
          admissionsMap.set(admissionDate, currentCount + 1)
        })
      }
      
      // Convert map to array for chart data
      const chartData = Array.from(admissionsMap, ([date, admissions]) => ({
        date,
        admissions
      })).sort((a, b) => a.date.localeCompare(b.date))
      
      setPatientAdmissionsData(chartData)
      return chartData
    } catch (err) {
      console.error("Error fetching patient admissions:", err)
      return []
    }
  }, [])

  // Create a new patient using server action
  const createPatient = useCallback(async (patientData: PatientFormValues): Promise<PatientOperationResult> => {
    try {
      const result = await createPatientAction(patientData)
      
      if (!result.success) {
        throw result.error
      }
      
      // The real-time subscription will handle updating the UI
      
      return { success: true, data: result.data }
    } catch (err) {
      console.error("Error creating patient:", err)
      return { success: false, error: err }
    }
  }, [])

  // Update an existing patient using server action
  const updatePatient = useCallback(async (updatedPatient: Patient): Promise<PatientOperationResult> => {
    try {
      const result = await updatePatientAction(updatedPatient)
      
      if (!result.success) {
        throw result.error
      }
      
      // Optimistically update UI (the real-time subscription will sync eventually)
      setPatients(prevPatients => 
        prevPatients.map(p => p.id === updatedPatient.id ? updatedPatient : p)
      )
      
      return { success: true, data: result.data }
    } catch (err) {
      console.error("Error updating patient:", err)
      return { success: false, error: err }
    }
  }, [])

  // Delete a patient using server action
  const deletePatient = useCallback(async (patientId: string): Promise<PatientOperationResult> => {
    try {
      const result = await deletePatientAction(patientId)
      
      if (!result.success) {
        throw result.error
      }
      
      // Optimistically update UI (the real-time subscription will sync eventually)
      setPatients(prevPatients => 
        prevPatients.filter(p => p.id !== patientId)
      )
      
      return { success: true }
    } catch (err) {
      console.error("Error deleting patient:", err)
      return { success: false, error: err }
    }
  }, [])

  // Handle real-time database changes
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

  // Handle real-time billing changes
  const handleBillingChange = useCallback((payload: any, currentPatientId: string | null) => {
    if (!currentPatientId) return;
    
    if (payload.eventType === 'INSERT' && payload.new.patient_id === currentPatientId) {
      setBillingHistory(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE' && payload.new.patient_id === currentPatientId) {
      setBillingHistory(prev => 
        prev.map(record => record.id === payload.new.id ? payload.new : record)
      );
    } else if (payload.eventType === 'DELETE' && payload.old.patient_id === currentPatientId) {
      setBillingHistory(prev => 
        prev.filter(record => record.id !== payload.old.id)
      );
    }
  }, []);

  // Set up real-time database changes
  useEffect(() => {
    // Initial data fetch
    fetchPatients()
    fetchPatientAdmissions()

    // Set up real-time subscription
    const patientChannel = supabase
      .channel('patients-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'patients' }, 
          handlePatientChange)
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(patientChannel)
    }
  }, [fetchPatients, fetchPatientAdmissions, handlePatientChange])

  return {
    patients,
    isLoading,
    error,
    patientAdmissionsData,
    billingHistory,
    isBillingLoading,
    billingError,
    fetchPatients,
    fetchPatientAdmissions,
    fetchPatientBillingHistory,
    createPatient,
    updatePatient,
    deletePatient,
    handlePatientChange,
    handleBillingChange
  }
}