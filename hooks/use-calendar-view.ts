import { useState, useCallback } from 'react'
import { addWeeks, subWeeks } from 'date-fns'

export function useCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeek(prev => subWeeks(prev, 1))
    setSelectedDate(prev => subWeeks(prev, 1))
  }, [])

  const goToNextWeek = useCallback(() => {
    setCurrentWeek(prev => addWeeks(prev, 1))
    setSelectedDate(prev => addWeeks(prev, 1))
  }, [])

  const goToToday = useCallback(() => {
    const today = new Date()
    setSelectedDate(today)
    setCurrentWeek(today)
  }, [])

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setCurrentWeek(date)
    }
  }, [])

  return {
    selectedDate,
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    handleDateSelect,
  }
}