import { useAppointments } from './use-appointments'
import { useCalendarView } from './use-calendar-view'
import { useFilters } from './use-filters'
import { useDialog } from './use-dialog'
import { useEffect } from 'react'
import { useDepartments } from './use-departments'

export function useAppointmentPage() {
  const {
    isLoading,
    appointments,
    filteredAppointments,
    stats,
    fetchAppointments,
    filterAppointments,
    handleStatusChange,
    handleNewAppointment,
    getAppointmentsForDate,
  } = useAppointments()

  const {
    selectedDate,
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    handleDateSelect,
  } = useCalendarView()

  const { departments, doctors, fetchDepartments, fetchDoctors } = useDepartments()

  const {
    filters,
    setters,
    resetFilters
  } = useFilters()

  const newAppointmentDialog = useDialog(false)

  // Run initial fetches
  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Apply filters when they change
  useEffect(() => {
    filterAppointments(
      filters.departmentFilter,
      filters.doctorFilter,
      filters.statusFilter
    )
  }, [filterAppointments, filters.departmentFilter, filters.doctorFilter, filters.statusFilter])



  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, [])



  return {
    // Loading state
    isLoading,

    // Calendar state and controls
    selectedDate,
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    handleDateSelect,

    // Appointment data and operations
    appointments,
    filteredAppointments,
    stats,
    handleStatusChange,
    handleNewAppointment,
    getAppointmentsForDate,

    // Filter state and operations
    filters,
    setters,
    resetFilters,

    // Department and Doctors
    departments, 
    doctors,
    // Dialog controls
    newAppointmentDialog
  }
}