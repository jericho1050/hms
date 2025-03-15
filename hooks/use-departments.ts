import { useCallback, useState, useEffect } from 'react';
import { supabase } from "@/utils/supabase/client";
import { Department } from '@/types/deparments';
import { Doctor } from '@/types/staff';

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    const fetchDepartments = useCallback(async () => {
        let { data: departments, error } = await supabase
            .from('departments')
            .select('*');

        if (error) throw error;

        // Replace the departments array instead of adding to it
        if (departments) {
            setDepartments(departments);
        }
        
        return departments || [];
    }, [])

    const fetchDoctors = useCallback(async () => {
        try {
            // Fetch staff (doctors) with more comprehensive role matching
            const { data: staffData, error: staffError } = await supabase
                .from('staff')
                .select('id, first_name, last_name, role, department')
                .or(
                    'role.ilike.%doctor%,role.ilike.%physician%,role.ilike.%specialist%,' + 
                    'role.ilike.%surgeon%,role.ilike.%md%,role.ilike.%cardiologist%,' +
                    'role.ilike.%neurologist%,role.ilike.%pediatrician%,role.ilike.%psychiatrist%,' +
                    'role.ilike.%oncologist%,role.ilike.%radiologist%,role.ilike.%anesthesiologist%'
                ); 

            if (staffError) throw staffError;

            // Convert the returned data to match the Staff interface
            if (staffData) {
                const formattedStaff: Doctor[] = staffData.map(staff => ({
                    id: staff.id,
                    firstName: staff.first_name,
                    lastName: staff.last_name,
                    role: staff.role,
                    department: staff.department,
                    email: '', // Add required fields with defaults
                    phone: '',
                    specialty: '',
                    hireDate: '',
                    status: 'active',
                    address: '', // Add missing required field
                    joiningDate: '' // Add missing required field
                }));
                
                // Replace the doctors array instead of adding to it
                setDoctors(formattedStaff);
                return formattedStaff;
            }
            return [];
        } catch (error) {
            console.error('Error fetching doctors:', error);
            return [];
        }
    }, [])

    return { departments, doctors, fetchDepartments, fetchDoctors };
}