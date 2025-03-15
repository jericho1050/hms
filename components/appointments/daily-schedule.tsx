"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle,
  Calendar,
  AlertTriangle,
  User,
  UserCheck,
  ClipboardList,
} from "lucide-react"
import type { Appointment } from "@/types/appointments"
import { cn } from "@/lib/utils"

interface DailyScheduleProps {
  appointments: Appointment[]
  date: Date
  onStatusChange: (appointmentId: string, newStatus: string) => void
}

export function DailySchedule({ appointments, date, onStatusChange }: DailyScheduleProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Sort appointments by start time
  const sortedAppointments = [...appointments].sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Group appointments by time slot (hourly)
  const timeSlots: { [key: string]: Appointment[] } = {}

  // Create time slots from 8 AM to 6 PM
  for (let hour = 8; hour <= 18; hour++) {
    const timeSlot = hour < 10 ? `0${hour}:00` : `${hour}:00`
    timeSlots[timeSlot] = []
  }

  // Populate time slots with appointments
  sortedAppointments.forEach((appointment) => {
    const hour = appointment.startTime.substring(0, 2)
    const timeSlot = `${hour}:00`

    if (timeSlots[timeSlot]) {
      timeSlots[timeSlot].push(appointment)
    } else {
      // For appointments outside regular hours
      timeSlots[timeSlot] = [appointment]
    }
  })

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Scheduled
          </Badge>
        )
      case "checked-in":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Checked In
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Cancelled
          </Badge>
        )
      case "no-show":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            No Show
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule for {format(date, "EEEE, MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(timeSlots).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(timeSlots).map(([timeSlot, slotAppointments]) => (
                <div key={timeSlot} className="grid grid-cols-[80px_1fr] gap-4">
                  <div className="flex items-start">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {timeSlot}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {slotAppointments.length > 0 ? (
                      slotAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-md border",
                            appointment.status === "completed" && "bg-green-50 border-green-200",
                            appointment.status === "no-show" && "bg-red-50 border-red-200",
                            appointment.status === "cancelled" && "bg-gray-50 border-gray-200",
                            appointment.status === "checked-in" && "bg-yellow-50 border-yellow-200",
                            appointment.status === "in-progress" && "bg-purple-50 border-purple-200",
                            appointment.status === "scheduled" && "bg-blue-50 border-blue-200",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="font-medium">{appointment.patientName}</span>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="text-[10px]">
                                  {appointment.startTime} - {appointment.endTime}
                                </span>
                                <span>•</span>
                                <span className="text-xs">{appointment.department}</span>
                                <span>•</span>
                                <span className="text-xs line-clamp-1">Dr. {appointment.doctorName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {getStatusBadge(appointment.status)}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleViewDetails(appointment)}>
                                    <ClipboardList className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(appointment.id, "checked-in")}
                                  disabled={appointment.status !== "scheduled"}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Check In
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(appointment.id, "in-progress")}
                                  disabled={appointment.status !== "checked-in"}
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Start Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(appointment.id, "completed")}
                                  disabled={appointment.status !== "in-progress"}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Complete
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(appointment.id, "no-show")}
                                  disabled={
                                    appointment.status === "completed" ||
                                    appointment.status === "cancelled" ||
                                    appointment.status === "no-show"
                                  }
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Mark as No-Show
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(appointment.id, "cancelled")}
                                  disabled={
                                    appointment.status === "completed" ||
                                    appointment.status === "cancelled" ||
                                    appointment.status === "no-show"
                                  }
                                  className="text-amber-600"
                                >
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-12 rounded-md border border-dashed text-sm text-muted-foreground">
                        No appointments scheduled
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Appointments</h3>
              <p className="text-sm text-muted-foreground mt-1">There are no appointments scheduled for this day.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>Appointment ID: {selectedAppointment.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-medium">Patient:</span>
                <span>{selectedAppointment.patientName}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-medium">Doctor:</span>
                <span>Dr. {selectedAppointment.doctorName}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-medium">Department:</span>
                <span>{selectedAppointment.department}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-medium">Date:</span>
                <span>{format(parseISO(selectedAppointment.date), "MMMM d, yyyy")}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-medium">Time:</span>
                <span>
                  {selectedAppointment.startTime} - {selectedAppointment.endTime}
                </span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-medium">Type:</span>
                <span>{selectedAppointment.type}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-medium">Status:</span>
                <span>{getStatusBadge(selectedAppointment.status)}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <span className="font-medium">Notes:</span>
                <span>{selectedAppointment.notes || "No notes provided"}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

