"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { MoreVertical, CheckCircle, XCircle, AlertTriangle, User, UserCheck, Calendar } from "lucide-react"
import type { Appointment } from "@/types/appointments"

interface AppointmentListProps {
  appointments: Appointment[]
  onStatusChange: (appointmentId: string, newStatus: string) => void
}

export function AppointmentList({ appointments, onStatusChange }: AppointmentListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Sort appointments by date and time
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date)
    if (dateComparison !== 0) return dateComparison
    return a.startTime.localeCompare(b.startTime)
  })

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

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border shadow-sm">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[140px]">Date & Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((appointment) => (
                <TableRow key={appointment.id} className="hover:bg-muted/30">
                  <TableCell className="py-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded flex items-center justify-center mr-1">
                        <span className="text-xs font-medium">{format(parseISO(appointment.date), "dd")}</span>
                      </div>
                      <div>
                        <div className="font-medium">{format(parseISO(appointment.date), "MMM d")}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{appointment.patientName}</TableCell>
                  <TableCell>Dr. {appointment.doctorName}</TableCell>
                  <TableCell className="hidden md:table-cell">{appointment.department}</TableCell>
                  <TableCell className="hidden sm:table-cell">{appointment.type}</TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>View Details</DropdownMenuItem>
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No appointments found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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

