import { useAppointments } from './use-appointments'
import { useCalendarView } from './use-calendar-view'
import { useFilters } from './use-filters'
import { useDialog } from './use-dialog'
import { useEffect } from 'react'

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
    getFilters
  } = useAppointments()

  const {
    selectedDate,
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    handleDateSelect,
  } = useCalendarView()

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
    getFilters,

    // Dialog controls
    newAppointmentDialog
  }
}