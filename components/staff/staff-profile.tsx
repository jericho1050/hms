"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Briefcase, Calendar, GraduationCap, Award, Clock } from "lucide-react"
import type { Staff } from "@/types/staff"

interface StaffProfileProps {
  staff: Staff
  isOpen: boolean
  onClose: () => void
}

export function StaffProfile({ staff, isOpen, onClose }: StaffProfileProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Inactive
          </Badge>
        )
      case "on-leave":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            On Leave
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {staff.firstName} {staff.lastName}
            {getStatusBadge(staff.status)}
          </DialogTitle>
          <DialogDescription>
            Staff ID: {staff.id} • {staff.role} • {staff.department}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Personal Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium w-32">Full Name:</span>
                      <span>
                        {staff.firstName} {staff.lastName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Role:</span>
                      <span>{staff.role}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Department:</span>
                      <span>{staff.department}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Status:</span>
                      <span>{getStatusBadge(staff.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Employment Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium w-32">Joining Date:</span>
                      <span>{staff.joiningDate}</span>
                    </div>
                    {staff.licenseNumber && (
                      <div className="flex items-center">
                        <span className="font-medium w-32">License Number:</span>
                        <span>{staff.licenseNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium w-32">Email:</span>
                      <span>{staff.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Phone:</span>
                      <span>{staff.phone}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-32">Address:</span>
                      <span>{staff.address}</span>
                    </div>
                  </div>
                </div>

                {staff.specialty && (
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium flex items-center mb-2">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Specialty
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span>{staff.specialty}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-4 mt-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium flex items-center mb-4">
                <GraduationCap className="h-4 w-4 mr-2" />
                Education & Qualifications
              </h3>
              {staff.qualification ? (
                <div className="space-y-4">
                  <div className="border-l-2 border-primary pl-4 py-1">
                    <div className="font-medium">{staff.qualification}</div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No qualification information available</p>
              )}
            </div>

            {staff.role === "Doctor" && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center mb-4">
                  <Award className="h-4 w-4 mr-2" />
                  Certifications & Licenses
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium w-32">License Number:</span>
                    <span>{staff.licenseNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-32">Specialty:</span>
                    <span>{staff.specialty}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium flex items-center mb-4">
                <Clock className="h-4 w-4 mr-2" />
                Weekly Schedule
              </h3>
              {staff.availability && Object.keys(staff.availability).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                    <div key={day} className="border rounded-md p-3">
                      <div className="font-medium capitalize">{day}</div>
                      <div className="mt-2">{getShiftBadge(staff.availability?.[day] || "off")}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No schedule information available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

