"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Phone, FileText, Users, CreditCard, Calendar, Activity } from "lucide-react"
import type { Patient } from "@/types/patients"

interface PatientDetailsDialogProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
}

export function PatientDetailsDialog({ patient, isOpen, onClose }: PatientDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {patient.firstName} {patient.lastName}
            <Badge variant="outline" className="ml-2 capitalize">
              {patient.gender}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Patient ID: {patient.id} • Date of Birth: {new Date(patient.dateOfBirth).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Personal Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-medium w-32">Full Name:</span>
                      <span>
                        {patient.firstName} {patient.lastName}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32">Date of Birth:</span>
                      <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32">Gender:</span>
                      <span className="capitalize">{patient.gender}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32">Marital Status:</span>
                      <span className="capitalize">{patient.maritalStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium w-32">Phone:</span>
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Email:</span>
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-32">Address:</span>
                      <span>
                        {patient.address}, {patient.city}, {patient.state} {patient.zipCode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2" />
                    Emergency Contact
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-medium w-32">Name:</span>
                      <span>{patient.emergencyContactName || "Not provided"}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32">Relationship:</span>
                      <span>{patient.emergencyContactRelationship || "Not provided"}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32">Phone:</span>
                      <span>{patient.emergencyContactPhone || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Insurance Information
                  </h3>
                  {patient.insuranceProvider ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="font-medium w-32">Provider:</span>
                        <span>{patient.insuranceProvider}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-32">Policy Number:</span>
                        <span>{patient.insuranceId}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-32">Group Number:</span>
                        <span>{patient.insuranceGroupNumber || "Not provided"}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No insurance information provided</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center mb-2">
                  <Activity className="h-4 w-4 mr-2" />
                  Medical Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-32">Blood Type:</span>
                    <span>{patient.bloodType || "Unknown"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-32">Allergies:</span>
                    <span>{patient.allergies?.length ? patient.allergies.join(", ") : "None reported"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-32">Chronic Conditions:</span>
                    <span>{patient.chronicConditions || "None reported"}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center mb-2">
                  <FileText className="h-4 w-4 mr-2" />
                  Medications & History
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="font-medium w-32">Current Medications:</span>
                    <span>{patient.currentMedications || "None reported"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-32">Past Surgeries:</span>
                    <span>{patient.pastSurgeries || "None reported"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Recent Medical Records</h3>
              <p className="text-sm text-muted-foreground">No recent medical records found</p>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <div className="border rounded-md p-4 mt-4">
              <h3 className="font-medium flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Appointment History
              </h3>
              <p className="text-sm text-muted-foreground">No appointment history found</p>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <div className="border rounded-md p-4 mt-4">
              <h3 className="font-medium flex items-center mb-2">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing History
              </h3>
              <p className="text-sm text-muted-foreground">No billing history found</p>
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

