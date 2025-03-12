"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { DayClickEventHandler } from "react-day-picker"
import { format, isToday, isSameMonth, isSameDay, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "@/types/appointments"

interface CalendarProps {
  mode: "single" | "range"
  selected: Date
  onSelect: (date: Date | undefined) => void
  appointments: Appointment[]
  className?: string
  disableWeekends?: boolean
  disabledDates?: Date[]
  minDate?: Date
  maxDate?: Date
}

export function AppointmentCalendar({ 
  mode = "single", 
  selected, 
  onSelect, 
  appointments, 
  className,
  disableWeekends = false,
  disabledDates = [],
  minDate,
  maxDate
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment) => isSameDay(parseISO(appointment.date), date))
  }

  // Get the count of appointments by status for a date
  const getAppointmentStatusCount = (date: Date) => {
    const dateAppointments = getAppointmentsForDate(date)
    return {
      total: dateAppointments.length,
      scheduled: dateAppointments.filter((a) => a.status === "scheduled").length,
      completed: dateAppointments.filter((a) => a.status === "completed").length,
      cancelled: dateAppointments.filter((a) => a.status === "cancelled" || a.status === "no-show").length,
    }
  }

  // Check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    // Check if it's outside the current month
    if (!isSameMonth(date, currentMonth)) return true;
    
    // Check if it's a weekend and weekends are disabled
    if (disableWeekends && (date.getDay() === 0 || date.getDay() === 6)) return true;
    
    // Check if it's in the disabledDates array
    if (disabledDates.some(disabledDate => isSameDay(disabledDate, date))) return true;
    
    // Check if it's before minDate
    if (minDate && date < minDate) return true;
    
    // Check if it's after maxDate
    if (maxDate && date > maxDate) return true;
    
    return false;
  };

  const handleDayClick: DayClickEventHandler = (day, modifiers, e) => {
    // Only allow selecting days that aren't disabled
    if (!isDateDisabled(day)) {
      onSelect(day);
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const firstDayOfPrevMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
      return firstDayOfPrevMonth
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const firstDayOfNextMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
      return firstDayOfNextMonth
    })
  }

  const handleToday = () => {
    setCurrentMonth(new Date())
    onSelect(new Date())
  }

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    // Calculate days from previous month
    const daysFromPrevMonth = startingDayOfWeek
    const prevMonthDays = []
    if (daysFromPrevMonth > 0) {
      const lastDayOfPrevMonth = new Date(year, month, 0)
      const prevMonthLastDate = lastDayOfPrevMonth.getDate()
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        prevMonthDays.push(new Date(year, month - 1, prevMonthLastDate - i))
      }
    }

    // Current month days
    const currentMonthDays = []
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push(new Date(year, month, i))
    }

    // Calculate days from next month
    const totalDays = prevMonthDays.length + currentMonthDays.length
    const daysFromNextMonth = Math.ceil(totalDays / 7) * 7 - totalDays
    const nextMonthDays = []
    for (let i = 1; i <= daysFromNextMonth; i++) {
      nextMonthDays.push(new Date(year, month + 1, i))
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
  }

  const days = generateCalendarDays()

  return (
    <div className={cn("calendar-container", className)}>
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="font-semibold">{format(currentMonth, "MMMM yyyy")}</div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday} className="h-8 text-xs">
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid with bigger day cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days - Improved styling */}
          <TooltipProvider>
            {days.map((day, index) => {
              const isSelected = isSameDay(selected, day);
              const isCurrentMonth = isSameMonth(currentMonth, day);
              const appointmentCounts = getAppointmentStatusCount(day);
              const hasAppointments = appointmentCounts.total > 0;
              const isCurrentDay = isToday(day);
              
              // Determine if the day should be disabled
              const isDisabled = isDateDisabled(day);
              
              // Weekend styling
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              
              return (
                <Tooltip key={day.toISOString()}>
                  <TooltipTrigger asChild disabled={isDisabled}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-14 w-full rounded-full p-1 font-normal relative",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                        !isCurrentMonth && "text-muted-foreground opacity-50 cursor-not-allowed",
                        isCurrentDay && !isSelected && "border-2 border-primary",
                        hasAppointments && !isSelected && isCurrentMonth && "bg-muted/30",
                        isDisabled && "pointer-events-none opacity-50 cursor-not-allowed",
                        isWeekend && disableWeekends && "bg-muted/20"
                      )}
                      onClick={(e) => handleDayClick(day, { selected: isSelected }, e)}
                      disabled={isDisabled}
                    >
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <span className={cn("text-sm mb-1", isSelected && "font-semibold")}>
                          {format(day, "d")}
                        </span>
                        {hasAppointments && isCurrentMonth && (
                          <div className="flex gap-1 mt-1">
                            {appointmentCounts.scheduled > 0 && (
                              <Badge variant="secondary" className="text-[10px] h-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
                                {appointmentCounts.scheduled}
                              </Badge>
                            )}
                            {appointmentCounts.completed > 0 && (
                              <Badge variant="secondary" className="text-[10px] h-4 bg-green-100 text-green-800 hover:bg-green-200">
                                {appointmentCounts.completed}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  {/* Only show tooltip for non-disabled days */}
                  {hasAppointments && isCurrentMonth && !isDisabled && (
                    <TooltipContent side="right" align="start" className="p-0 overflow-hidden">
                      <div className="p-2">
                        <p className="font-medium border-b pb-1 mb-2">{format(day, "MMMM d, yyyy")}</p>
                        <div className="flex flex-col gap-1">
                          {/* Same tooltip content as before */}
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

