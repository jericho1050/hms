import { useState, useCallback } from "react"
import { supabase } from "@/utils/supabase/client"

export type Patient = { id: string; [key: string]: any }

export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([])

  const fetchPatients = useCallback(async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      
    if (!error && data) {
      setPatients(data)
    } else if (error) {
      console.error("Error fetching patients:", error)
    }
  }, [])

  const handlePatientChange = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT') {
      setPatients(prevPatients => 
        [payload.new as Patient, ...prevPatients].slice(0, 10)
      )
    } else if (payload.eventType === 'UPDATE') {
      setPatients(prevPatients => 
        prevPatients.map(patient => 
          patient.id === payload.new.id ? (payload.new as Patient) : patient
        )
      )
    } else if (payload.eventType === 'DELETE') {
      setPatients(prevPatients => 
        prevPatients.filter(patient => patient.id !== payload.old.id)
      )
    }
  }, [])

  return {
    patients,
    fetchPatients,
    handlePatientChange
  }
}