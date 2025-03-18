"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import type { Room, Department, Bed, RoomStatus } from "@/types/rooms"

export async function getRoomsData() {
  const supabase = await createClient()
  
  // 1. Fetch rooms
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*, department:departments(name, color)')

  if (roomsError) {
    console.error('Error fetching rooms:', roomsError)
    return { rooms: [], error: roomsError.message }
  }

  // 2. Fetch current patient room assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from('patient_room_assignments')
    .select(`
      id, 
      room_id, 
      patient_id, 
      bed_number, 
      admission_date, 
      discharge_date
    `)
    .is('discharge_date', null) // Only active assignments
  
  if (assignmentsError) {
    console.error('Error fetching room assignments:', assignmentsError)
    return { rooms: [], error: assignmentsError.message }
  }

  // 3. Fetch patient data in a separate query (more reliable than joins)
  const patientIds = assignments?.map(a => a.patient_id).filter(Boolean) || []
  
  let patientsMap: Record<string, { name: string }> = {}
  
  if (patientIds.length > 0) {
    const { data: patients } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .in('id', patientIds)
    
    // Create a map of patient_id -> patient name for quick lookup
    patientsMap = (patients || []).reduce((map, patient) => {
      map[patient.id] = { 
        name: `${patient.first_name} ${patient.last_name}` 
      }
      return map
    }, {} as Record<string, { name: string }>)
  }

  // 4. Transform the data with patient names
  const roomsWithBeds = rooms.map(room => {
    // Create virtual bed objects based on room capacity
    const beds = []
    for (let i = 1; i <= room.capacity; i++) {
      // Find assignment for this room and bed number
      const assignment = assignments?.find(a => 
        a.room_id === room.id && 
        a.bed_number === i && 
        a.discharge_date === null
      )
      
      // Get patient name from our map
      const patientName = assignment?.patient_id 
        ? patientsMap[assignment.patient_id]?.name
        : undefined
      
      beds.push({
        id: `${room.id}-bed-${i}`, // Generate a virtual bed ID
        name: `Bed ${i}`,
        type: "Standard",
        patientId: assignment?.patient_id || null,
        patientName: patientName, // Add the patient name
        admissionDate: assignment?.admission_date,
        assignmentId: assignment?.id // Store assignment ID for updates
      })
    }
    
    // Calculate room status and return transformed room
    const totalBeds = beds.length
    const occupiedBeds = beds.filter(bed => bed.patientId).length
    
    let status = 'available'
    if (occupiedBeds === totalBeds) {
      status = 'full'
    } else if (occupiedBeds > 0) {
      status = 'partial'
    }
    
    return { 
      ...room, 
      beds,
      status,
      departmentId: room.department_id,
      // Map room features as "name" if available
      name: room.features?.name || `Room ${room.room_number}`,
      facilities: room.amenities || [],
      wing: room.wing || '',
      floor: room.floor || '',
      notes: room.features?.notes || '',
      type: room.room_type
    }
  })
  
  return { rooms: roomsWithBeds, error: null }
}

export async function getDepartmentsData() {
  const supabase = await createClient()
  
  const { data: departments, error } = await supabase
    .from('departments')
    .select('*')
    
  if (error) {
    console.error('Error fetching departments:', error)
    return { departments: [], error: error.message }
  }
  
  return { departments, error: null }
}

export async function getPatientsData() {
  const supabase = await createClient()
  
  const { data: patients, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name')
    
  if (error) {
    console.error('Error fetching patients:', error)
    return { patients: [], error: error.message }
  }
  
  // Format patient data to match expected format
  const formattedPatients = patients.map(patient => ({
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`
  }))
  
  return { patients: formattedPatients, error: null }
}

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

export async function getRoomHistory(roomId: string) {
  const supabase = await createClient()
  
  type AssignmentRecord = {
    id: string
    admission_date: string
    discharge_date: string | null
    notes: string | null
    status: string
    bed_number: number
    patients: {
      first_name: string
      last_name: string
    } | null
    staff: {
      first_name: string
      last_name: string
    } | null
  }
  
  const { data: history, error } = await supabase
    .from('patient_room_assignments')
    .select(`
      id, 
      admission_date, 
      discharge_date, 
      notes, 
      status,
      bed_number,
      patients:patients!patient_id(first_name, last_name),
      staff:staff!assigned_by(first_name, last_name)
    `)
    .eq('room_id', roomId)
    .order('admission_date', { ascending: false })
    .limit(20)
  
  if (error) {
    console.error('Error fetching room history:', error)
    return { history: [], error: error.message }
  }
  
  // Format history data
  const formattedHistory = (history as unknown as AssignmentRecord[]).map(item => {
    const patient = item.patients || { first_name: 'Unknown', last_name: 'Patient' }
    const staff = item.staff || { first_name: 'Unknown', last_name: 'Staff' }
    
    const patientName = `${patient.first_name} ${patient.last_name}`
    const staffName = `${staff.first_name} ${staff.last_name}`
    
    let action = `Patient ${patientName} assigned to bed ${item.bed_number}`
    if (item.discharge_date) {
      action = `Patient ${patientName} discharged from bed ${item.bed_number}`
      if (item.notes) action += `: ${item.notes}`
    }
    
    return {
      action,
      timestamp: new Date(item.admission_date).toLocaleString(),
      user: staffName
    }
  })
  
  return { history: formattedHistory, error: null }
}