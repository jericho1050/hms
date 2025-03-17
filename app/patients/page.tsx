import { Suspense } from "react"
import { mapDbPatientToPatient } from "@/app/actions/utils"
import PatientsClient from "./patients-client"
import type { Patient } from "@/types/patients"
import { createClient } from "@/utils/supabase/server"

// This is a Server Component that fetches initial data
export default async function PatientsPage() {
  // Server-side data fetching
  const supabase = await createClient();
  
  // Get initial patients data (first page only)
  const { data, error } = await supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 9) // Get first 10 patients for initial load
  
  // Map database records to our Patient interface
  const initialPatients: Patient[] = error || !data 
    ? [] 
    : data.map(mapDbPatientToPatient)
  
  // Get total count for pagination
  const totalCount = error ? 0 : data?.length || 0
  
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Loading patients...</div>}>
      <PatientsClient initialPatients={initialPatients} initialCount={totalCount} />
    </Suspense>
  )
}
