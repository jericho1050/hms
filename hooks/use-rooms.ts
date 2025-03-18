"use client"

import { useState, useEffect, useCallback } from 'react';
import type { Room, Department, Bed, RoomStatus } from '@/types/rooms';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from './use-auth';
import { useStaff } from './use-staff';

// Interface for database room structure
// interface DbRoom {
//   id: string;
//   room_number: string;
//   capacity: number;
//   room_type: string;
//   department_id: string | null;
//   floor?: string | null;
//   wing?: string | null;
//   amenities?: string[] | null;
//   features?: any;
//   department?: {
//     name: string;
//     color: string | null;
//   } | null;
// }

// // Interface for database assignment structure
// interface DbAssignment {
//   id: string;
//   room_id: string;
//   patient_id: string;
//   bed_number: number;
//   admission_date: string;
//   discharge_date: string | null;
//   status?: string | null;
//   notes?: string | null;
// }

// // Interface for database patient structure
// interface DbPatient {
//   id: string;
//   first_name: string;
//   last_name: string;
// }



export function useRooms() {
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { staffId } = useStaff();
  
  const getRoomsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      
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
        
        // Create a map of patient_id -> patient name for quick lookup
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
      
      setRooms(roomsWithBeds);
      return { rooms: roomsWithBeds, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { rooms: [], error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDepartmentsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      
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
      
      setDepartments(formattedDepartments);
      return { departments: formattedDepartments, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { departments: [], error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPatientsData = useCallback(async () => {
    setError(null);
    try {
      const supabase = createClient();
      
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name');
        
      if (patientsError) {
        throw new Error(`Error fetching patients: ${patientsError.message}`);
      }
      
      // Format patient data to match expected format
      const formattedPatients = patientsData.map(patient => ({
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`
      }));
      
      return { patients: formattedPatients, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { patients: [], error: errorMessage };
    }
  }, []);

  const getRoomHistory = useCallback(async (roomId: string) => {
    setError(null);
    try {
      const supabase = createClient();
      
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
        .limit(20);
      
      if (error) {
        throw new Error(`Error fetching room history: ${error.message}`);
      }
      
      // Format history data
      const formattedHistory = (history as unknown as AssignmentRecord[]).map(item => {
        const patient = item.patients || { first_name: 'Unknown', last_name: 'Patient' };
        const staff = item.staff || { first_name: 'Unknown', last_name: 'Staff' };
        
        const patientName = `${patient.first_name} ${patient.last_name}`;
        const staffName = `${staff.first_name} ${staff.last_name}`;
        
        let action = `Patient ${patientName} assigned to bed ${item.bed_number}`;
        if (item.discharge_date) {
          action = `Patient ${patientName} discharged from bed ${item.bed_number}`;
          if (item.notes) action += `: ${item.notes}`;
        }
        
        return {
          action,
          timestamp: new Date(item.admission_date).toLocaleString(),
          user: staffName
        };
      });
      
      return { history: formattedHistory, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { history: [], error: errorMessage };
    }
  }, []);

  useEffect(() => {
    getRoomsData();
    getDepartmentsData();
  }, [getRoomsData, getDepartmentsData]);

  return {
    rooms,
    departments,
    isLoading,
    error,
    getRoomsData,
    getDepartmentsData,
    getPatientsData,
    getRoomHistory,
  };
}
