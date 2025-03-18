"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function assignBedToPatient(
  roomId: string,
  bedId: string,
  patientId: string,
  assignedBy: string,
  admissionDate: string = new Date().toISOString(),
  expectedDischargeDate?: string,
  isEmergency: boolean = false
) {
  const supabase = await createClient()
  
  // Parse the bed number from the virtual bed ID
  const bedNumber = parseInt(bedId.split('-bed-')[1])
  
  if (isNaN(bedNumber)) {
    return { success: false, error: 'Invalid bed identifier' }
  }
  
  // Insert into patient_room_assignments
  const { error: assignmentError } = await supabase
    .from('patient_room_assignments')
    .insert({
      patient_id: patientId,
      room_id: roomId,
      bed_number: bedNumber,
      assigned_by: assignedBy, // Should be a valid staff ID in production
      admission_date: admissionDate,
      status: isEmergency ? 'emergency' : 'occupied',
      notes: isEmergency ? 'Emergency admission' : null
    })
  
  if (assignmentError) {
    console.error('Error assigning bed:', assignmentError)
    return { success: false, error: assignmentError.message }
  }
  
  // Update room occupancy
  const { error: roomError } = await supabase
    .rpc('recalculate_room_occupancy')
  
  if (roomError) {
    console.error('Error updating room occupancy:', roomError)
    // We still consider the assignment successful
  }
  
  revalidatePath('/rooms')
  return { success: true }
}

export async function releaseBed(
  roomId: string,
  bedId: string,
  releasedBy: string,
  notes?: string
) {
  const supabase = await createClient()
  
  // Parse assignment ID from bed data (if available)
  const assignmentId = bedId.includes('assignment-') 
    ? bedId.split('assignment-')[1]
    : null
  
  if (assignmentId) {
    // If we have a direct assignment ID, use it
    const { error: dischargeError } = await supabase
      .rpc('discharge_patient_from_room', { p_assignment_id: assignmentId })
    
    if (dischargeError) {
      console.error('Error releasing bed:', dischargeError)
      return { success: false, error: dischargeError.message }
    }
    
    // Add notes if provided
    if (notes) {
      const { error: updateError } = await supabase
        .from('patient_room_assignments')
        .update({ notes })
        .eq('id', assignmentId)
      
      if (updateError) {
        console.error('Error updating assignment notes:', updateError)
        // We still consider the release successful
      }
    }
  } else {
    // Parse the bed number from the virtual bed ID
    const bedNumber = parseInt(bedId.split('-bed-')[1])
    
    if (isNaN(bedNumber)) {
      return { success: false, error: 'Invalid bed identifier' }
    }
    
    // Find the active assignment for this room and bed
    const { data: assignment, error: findError } = await supabase
      .from('patient_room_assignments')
      .select('id')
      .eq('room_id', roomId)
      .eq('bed_number', bedNumber)
      .is('discharge_date', null)
      .single()
      
    if (findError) {
      console.error('Error finding assignment:', findError)
      return { success: false, error: findError.message }
    }
    
    if (!assignment) {
      return { success: false, error: 'No active assignment found for this bed' }
    }
    
    // Discharge the patient
    const { error: dischargeError } = await supabase
      .rpc('discharge_patient_from_room', { p_assignment_id: assignment.id })
    
    if (dischargeError) {
      console.error('Error releasing bed:', dischargeError)
      return { success: false, error: dischargeError.message }
    }
    
    // Add notes if provided
    if (notes) {
      const { error: updateError } = await supabase
        .from('patient_room_assignments')
        .update({ notes })
        .eq('id', assignment.id)
      
      if (updateError) {
        console.error('Error updating assignment notes:', updateError)
        // We still consider the release successful
      }
    }
  }
  
  // Update room occupancy
  const { error: roomError } = await supabase
    .rpc('recalculate_room_occupancy')
  
  if (roomError) {
    console.error('Error updating room occupancy:', roomError)
    // We still consider the release successful
  }
  
  revalidatePath('/rooms')
  return { success: true }
}