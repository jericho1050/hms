import { useState, useEffect, useCallback } from 'react'
import { supabase } from "@/utils/supabase/client"
import type { Appointment } from '@/types/appointments'
import { isSameDay, parseISO } from 'date-fns'

export function useAppointments() {
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    totalToday: 0,
    completed: 0,
    noShows: 0,
    pending: 0,
  })

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: appointmentsData, error } = await supabase
        .from('appointment_dashboard_view')
        .select('*')
      if (error) throw error

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
        }))
        setAppointments(formattedAppointments)
        setFilteredAppointments(formattedAppointments)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter appointments
  const filterAppointments = useCallback(async (departmentFilter: string, doctorFilter: string, statusFilter: string) => {
    try {
      let query = supabase.from('appointment_dashboard_view').select('*')

      if (departmentFilter !== 'all') {
        query = query.ilike('department', departmentFilter)
      }

      if (doctorFilter !== 'all') {
        query = query.eq('doctorId', doctorFilter)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
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
        }))
        setFilteredAppointments(formattedAppointments)
      }
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }, [])

  // Handle appointment status changes
  const handleStatusChange = useCallback((appointmentId: string, newStatus: string) => {
    setAppointments(prevAppointments =>
      prevAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      )
    )
  }, [])

  // Handle new appointment creation
  const handleNewAppointment = useCallback((appointmentData: Partial<Appointment>) => {
    const newAppointment: Appointment = {
      id: `APP-${Math.floor(Math.random() * 10000)}`,
      patientId: appointmentData.patientId || '',
      patientName: appointmentData.patientName || '',
      doctorId: appointmentData.doctorId || '',
      doctorName: appointmentData.doctorName || '',
      department: appointmentData.department || '',
      date: appointmentData.date || new Date().toISOString(),
      startTime: appointmentData.startTime || '',
      endTime: appointmentData.endTime || '',
      status: 'scheduled',
      type: appointmentData.type || '',
      notes: appointmentData.notes || '',
    }

    setAppointments(prev => [...prev, newAppointment])
    return newAppointment
  }, [])

  // Get appointments for a specific date
  const getAppointmentsForDate = useCallback((selectedDate: Date) => {
    return filteredAppointments.filter(
      (appointment) => isSameDay(parseISO(appointment.date), selectedDate)
    )
  }, [filteredAppointments])

  // Get unique departments and doctors
  const getFilters = useCallback(() => {
    const departments = Array.from(new Set(appointments.map((a) => a.department)))
    const doctors = Array.from(new Set(appointments.map((a) => a.doctorId)))
    return { departments, doctors }
  }, [appointments])

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
    getFilters
  }
}