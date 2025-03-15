import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import type { Appointment } from '@/types/appointments';
import { isSameDay, parseISO, format } from 'date-fns';

export function useAppointments() {
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    completed: 0,
    noShows: 0,
    pending: 0,
  });

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: appointmentsData, error } = await supabase
        .from('appointment_dashboard_view')
        .select('*');
      if (error) throw error;

      if (appointmentsData) {
        const formattedAppointments = appointmentsData.map((app) => ({
          id: app.id || '',
          patientId: app.patientid || '',
          patientName: app.patientname || '',
          doctorId: app.doctorid || '',
          doctorName: app.doctorname || '',
          department: app.department || '',
          date: app.date || new Date().toISOString(),
          startTime: app.starttime || '',
          endTime: app.endtime || '',
          status: app.status || 'scheduled',
          type: app.type || '',
          notes: app.notes || '',
        }));

        setAppointments(formattedAppointments);
        setFilteredAppointments(formattedAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter appointments
  const filterAppointments = useCallback(
    async (
      departmentFilter: string,
      doctorFilter: string,
      statusFilter: string
    ) => {
      try {
        let query = supabase.from('appointment_dashboard_view').select('*');

        if (departmentFilter !== 'all') {
          query = query.ilike('department', departmentFilter);
        }

        if (doctorFilter !== 'all') {
          query = query.eq('doctorid', doctorFilter);
        }

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) throw error;
        if (data) {
          const formattedAppointments = data.map((app) => ({
            id: app.id || '',
            patientId: app.patientid || '',
            patientName: app.patientname || '',
            doctorId: app.doctorid || '',
            doctorName: app.doctorname || '',
            department: app.department || '',
            date: app.date || new Date().toISOString(),
            startTime: app.starttime || '',
            endTime: app.endtime || '',
            status: app.status || 'scheduled',
            type: app.type || '',
            notes: app.notes || '',
          }));
          setFilteredAppointments(formattedAppointments);
        }
      } catch (error) {
        console.error('Error applying filters:', error);
      }
    },
    []
  );
  // Update stats when appointments change
  useEffect(() => {
    if (appointments.length) {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const todayAppointments = appointments.filter(
        (appointment) => appointment.date.split('T')[0] === today
      );
      
      const completed = appointments.filter(
        (appointment) => appointment.status === 'completed' && appointment.date === today
      ).length;
      
      const noShows = appointments.filter(
        (appointment) => appointment.status === 'no-show'
      ).length;
      
      const pending = appointments.filter(
        (appointment) => 
          appointment.status === 'scheduled' || 
          appointment.status === 'checked-in' || 
          appointment.status === 'in-progress'
      ).length;
      setStats({
        totalToday: todayAppointments.length,
        completed,
        noShows,
        pending,
      });
    }
  }, [appointments]);

  // Handle appointment status changes
  const handleStatusChange = useCallback(
    async (appointmentId: string, newStatus: string) => {

      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)
        .select()

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );


      // Also update the filtered appointments array to ensure UI updates
      setFilteredAppointments((prevFilteredAppointments) =>
        prevFilteredAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
    },
    []
  );

  // Handle new appointment creation
  const handleNewAppointment = useCallback(
    async (appointmentData: Partial<Appointment>) => {
      console.log("the appointmentData parameter:", appointmentData);

      // Important: Format date to YYYY-MM-DD to prevent timezone issues
      // This ensures the date is stored exactly as selected without timezone offset
      let formattedDate: string;

      if (appointmentData.date) {
        // Use a reliable way to check if it's a Date object
        if (appointmentData.date && Object.prototype.toString.call(appointmentData.date) === '[object Date]') {
          // It's a proper Date object, format it
          const dateObj = appointmentData.date as unknown as Date;
          formattedDate = format(dateObj, 'yyyy-MM-dd');
        } else if (typeof appointmentData.date === 'string') {
          // If it's already a string, try to parse it as a date first to handle any timezone issues
          try {
            const parsedDate = new Date(appointmentData.date);
            formattedDate = format(parsedDate, 'yyyy-MM-dd');
          } catch (e) {
            // If parsing fails, use the string as is
            formattedDate = appointmentData.date;
          }
        } else {
          // Fallback to current date
          formattedDate = format(new Date(), 'yyyy-MM-dd');
        }
      } else {
        // No date provided, use current date
        formattedDate = format(new Date(), 'yyyy-MM-dd');
      }

      // Create the appointment object that will be returned to the UI
      const newAppointment: Appointment = {
        id: '', // Remove ID generation - let Supabase generate it
        patientId: appointmentData.patientId || '',
        patientName: appointmentData.patientName || '',
        doctorId: appointmentData.doctorId || '',
        doctorName: appointmentData.doctorName || '',
        department: appointmentData.department || '',
        date: formattedDate, // Use formatted date
        startTime: appointmentData.startTime || '',
        endTime: appointmentData.endTime || '',
        status: 'scheduled',
        type: appointmentData.type || '',
        notes: appointmentData.notes || '',
      };

      // Create the database object that matches Supabase schema
      const dbAppointment = {
        // Remove the id field to let Supabase generate it
        patient_id: newAppointment.patientId,
        staff_id: newAppointment.doctorId,
        appointment_date: newAppointment.date, // Use formatted date
        start_time: newAppointment.startTime,
        end_time: newAppointment.endTime,
        status: newAppointment.status,
        appointment_type: newAppointment.type,
        notes: newAppointment.notes,
        reason: null,
        room_number: null
      };

      // Insert into Supabase with properly formatted fields
      const { data, error } = await supabase
        .from('appointments')
        .insert(dbAppointment)
        .select();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      // Update the newAppointment with the ID generated by Supabase
      if (data && data[0]) {
        newAppointment.id = data[0].id;
      }

      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    },
    []
  );

  // Get appointments for a specific date
  const getAppointmentsForDate = useCallback(
    (selectedDate: Date) => {
      return filteredAppointments.filter((appointment) =>
        isSameDay(parseISO(appointment.date), selectedDate)
      );
    },
    [filteredAppointments]
  );

  return {
    isLoading,
    appointments,
    filteredAppointments,
    stats,
    fetchAppointments,
    filterAppointments,
    handleStatusChange,
    handleNewAppointment,
    getAppointmentsForDate,
  };
}
