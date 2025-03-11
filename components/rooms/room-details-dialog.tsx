"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BedIcon, CheckCircle2, ClipboardList, History, Info, Settings, UserPlus, XCircle } from "lucide-react"
import type { Room, Department, Bed } from "@/types/rooms"

interface RoomDetailsDialogProps {
  room: Room
  department?: Department
  onClose: () => void
  onAssignBed: (bedId: string) => void
  onReleaseBed: (bedId: string) => void
}

export function RoomDetailsDialog({ room, department, onClose, onAssignBed, onReleaseBed }: RoomDetailsDialogProps) {
  const getBedStatusIcon = (bed: Bed) => {
    if (bed.patientId) {
      return <Badge className="bg-red-500">Occupied</Badge>
    }
    return <Badge className="bg-green-500">Available</Badge>
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {room.name} - Room {room.roomNumber}
          </DialogTitle>
          <DialogDescription>
            {department?.name} • Floor {room.floor}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="beds">
          <TabsList>
            <TabsTrigger value="beds">
              <BedIcon className="mr-2 h-4 w-4" />
              Beds
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="mr-2 h-4 w-4" />
              Room Info
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="beds" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {room.beds.map((bed) => (
                <div key={bed.id} className="border rounded-lg p-4 flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{bed.name}</h3>
                      <p className="text-sm text-muted-foreground">{bed.type}</p>
                    </div>
                    {getBedStatusIcon(bed)}
                  </div>

                  {bed.patientId ? (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Patient ID:</span> {bed.patientId}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Admitted:</span> {bed.admissionDate || "N/A"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Expected Discharge:</span> {bed.expectedDischargeDate || "N/A"}
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => onReleaseBed(bed.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Release Bed
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground">This bed is currently available</p>
                      <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => onAssignBed(bed.id)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Patient
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium">Room Details</h3>
                <div className="text-sm">
                  <span className="font-medium">Room Type:</span> {room.type}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total Beds:</span> {room.beds.length}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Floor:</span> {room.floor}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Wing:</span> {room.wing}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Facilities</h3>
                <ul className="text-sm space-y-1">
                  {room.facilities.map((facility, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      {facility}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Notes</h3>
              <p className="text-sm text-muted-foreground">{room.notes || "No additional notes for this room."}</p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 pt-4">
            <div className="space-y-4">
              <h3 className="font-medium">Recent Activity</h3>

              <div className="border rounded-lg divide-y">
                {room.history && room.history.length > 0 ? (
                  room.history.map((event, index) => (
                    <div key={index} className="p-3 flex items-start">
                      <ClipboardList className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.timestamp} • {event.user}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-muted-foreground">No recent activity recorded for this room.</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Room Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

