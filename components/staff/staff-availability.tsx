"use client"

import { useState } from "react"
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar, Clock, Edit } from "lucide-react"
import type { Staff } from "@/types/staff"
import { useToast } from "@/hooks/use-toast"

interface StaffAvailabilityProps {
  staff: Staff[]
  onStaffUpdate: (updatedStaff: Staff) => void
}

export function StaffAvailability({ staff, onStaffUpdate }: StaffAvailabilityProps) {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<string>("")
  const [editingShift, setEditingShift] = useState<string>("morning")
  const { toast } = useToast()

  // Get days of the week
  const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 0 })
  const endOfCurrentWeek = endOfWeek(currentWeek, { weekStartsOn: 0 })

  const daysOfWeek = Array.from({ length: 7 }).map((_, index) => {
    const day = addDays(startOfCurrentWeek, index)
    return {
      date: day,
      dayName: format(day, "EEEE"),
      dayShort: format(day, "EEE"),
      dayOfMonth: format(day, "d"),
    }
  })

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  // Handle schedule editing
  const handleEditSchedule = (staff: Staff, day: string) => {
    setSelectedStaff(staff)
    setEditingDay(day)
    setEditingShift(staff.availability?.[day] || "off")
    setIsEditScheduleOpen(true)
  }

  const handleSaveSchedule = () => {
    if (!selectedStaff || !editingDay) return

    const updatedAvailability = {
      ...selectedStaff.availability,
      [editingDay]: editingShift,
    }

    const updatedStaff = {
      ...selectedStaff,
      availability: updatedAvailability,
    }

    onStaffUpdate(updatedStaff)

    toast({
      title: "Schedule Updated",
      description: `${selectedStaff.firstName} ${selectedStaff.lastName}'s schedule has been updated.`,
    })

    setIsEditScheduleOpen(false)
  }

  // Get shift badge
  const getShiftBadge = (shift: string) => {
    switch (shift) {
      case "morning":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Morning</Badge>
      case "afternoon":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Afternoon</Badge>
      case "night":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Night</Badge>
      case "on-call":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">On Call</Badge>
      case "off":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Off
          </Badge>
        )
      default:
        return <Badge variant="outline">{shift}</Badge>
    }
  }

  // Filter active staff
  const activeStaff = staff.filter((s) => s.status === "active")

  return (
    <div className="space-y-6">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            This Week
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-2 font-medium">
            {format(startOfCurrentWeek, "MMM d")} - {format(endOfCurrentWeek, "MMM d, yyyy")}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Staff Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium text-muted-foreground">Staff</th>
                  {daysOfWeek.map((day) => (
                    <th key={day.dayName} className="p-2 text-center font-medium text-muted-foreground">
                      <div>{day.dayShort}</div>
                      <div className="text-sm">{day.dayOfMonth}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeStaff.length > 0 ? (
                  activeStaff.map((staffMember) => (
                    <tr key={staffMember.id} className="border-t">
                      <td className="p-2 text-left">
                        <div className="font-medium">
                          {staffMember.firstName} {staffMember.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{staffMember.role}</div>
                      </td>
                      {daysOfWeek.map((day) => {
                        const shift = staffMember.availability?.[day.dayName.toLowerCase()] || "off"
                        return (
                          <td key={day.dayName} className="p-2 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {getShiftBadge(shift)}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleEditSchedule(staffMember, day.dayName.toLowerCase())}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-muted-foreground">
                      No active staff members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update {selectedStaff?.firstName} {selectedStaff?.lastName}'s schedule for {editingDay}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Shift:</span>
              </div>
              <Select value={editingShift} onValueChange={setEditingShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8AM - 4PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (4PM - 12AM)</SelectItem>
                  <SelectItem value="night">Night (12AM - 8AM)</SelectItem>
                  <SelectItem value="on-call">On Call</SelectItem>
                  <SelectItem value="off">Day Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditScheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

