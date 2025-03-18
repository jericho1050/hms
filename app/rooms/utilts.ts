import { createClient } from "@/utils/supabase/server";

// Type definitions
export type RoomStatus = 'available' | 'partial' | 'full';

export type Bed = {
  id: string;
  name: string;
  type: string;
  patientId: string | null;
  patientName?: string;
  admissionDate?: string;
  assignmentId?: string;
};

export type Room = {
  id: string;
  name: string;
  roomNumber: string;
  type: string;
  departmentId: string;
  floor: string;
  wing: string;
  status: RoomStatus;
  facilities: string[];
  notes: string;
  beds: Bed[];
};

export type Department = {
  id: string;
  name: string;
  color: string;
};

export async function getRoomsData() {
  try {
    const supabase = await createClient();
    
    // 1. Fetch rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('*, department:departments(name, color)');

    if (roomsError) {
      throw new Error(`Error fetching rooms: ${roomsError.message}`);
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
      .is('discharge_date', null); // Only active assignments
    
    if (assignmentsError) {
      throw new Error(`Error fetching room assignments: ${assignmentsError.message}`);
    }

    // 3. Fetch patient data in a separate query (more reliable than joins)
    const patientIds = assignments?.map(a => a.patient_id).filter(Boolean) || [];
    
    let patientsMap: Record<string, { name: string }> = {};
    
    if (patientIds.length > 0) {
      const { data: patients } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .in('id', patientIds);
      
      // Create a map of patient_id -> patient name for quick lookupg
      patientsMap = (patients || []).reduce((map, patient) => {
        map[patient.id] = { 
          name: `${patient.first_name} ${patient.last_name}` 
        };
        return map;
      }, {} as Record<string, { name: string }>);
    }
    
    // 4. Transform the data with patient names
    const roomsWithBeds = roomsData.map(room => {
      // Create virtual bed objects based on room capacity
      const beds: Bed[] = [];
      for (let i = 1; i <= room.capacity; i++) {
        // Find assignment for this room and bed number
        const assignment = assignments?.find(a => 
          a.room_id === room.id && 
          a.bed_number === i && 
          a.discharge_date === null
        );
        
        // Get patient name from our map
        const patientName = assignment?.patient_id 
          ? patientsMap[assignment.patient_id]?.name
          : undefined;
        
        beds.push({
          id: `${room.id}-bed-${i}`, // Generate a virtual bed ID
          name: `Bed ${i}`,
          type: "Standard",
          patientId: assignment?.patient_id || null,
          patientName: patientName, // Add the patient name
          admissionDate: assignment?.admission_date,
          assignmentId: assignment?.id // Store assignment ID for updates
        });
      }
      
      // Calculate room status and return transformed room
      const totalBeds = beds.length;
      const occupiedBeds = beds.filter(bed => bed.patientId).length;
      
      let status: RoomStatus = 'available';
      if (occupiedBeds === totalBeds) {
        status = 'full';
      } else if (occupiedBeds > 0) {
        status = 'partial';
      }
      
      // Get feature properties safely
      const features = typeof room.features === 'object' && room.features !== null
        ? room.features 
        : {};
        
      // Extract room name and notes from features
      const roomName = typeof features === 'object' && 'name' in features 
        ? String(features.name) 
        : undefined;
      
      const roomNotes = typeof features === 'object' && 'notes' in features 
        ? String(features.notes) 
        : undefined;
      
      return { 
        id: room.id, 
        name: roomName || `Room ${room.room_number}`,
        roomNumber: room.room_number,
        type: room.room_type || '',
        departmentId: room.department_id || '',
        floor: room.floor || '',
        wing: room.wing || '',
        status,
        facilities: room.amenities || [],
        notes: roomNotes || '',
        beds,
      } as Room;
    });
    
    return { rooms: roomsWithBeds, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return { rooms: [], error: errorMessage };
  }
}

export async function getDepartmentsData() {
  try {
    const supabase = await createClient();
    
    const { data: departmentsData, error: departmentsError } = await supabase
      .from('departments')
      .select('*');
      
    if (departmentsError) {
      throw new Error(`Error fetching departments: ${departmentsError.message}`);
    }
    
    const formattedDepartments = departmentsData.map(dept => ({
      id: dept.id,
      name: dept.name,
      color: dept.color || '#888888'
    }));
    
    return { departments: formattedDepartments, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return { departments: [], error: errorMessage };
  }
}