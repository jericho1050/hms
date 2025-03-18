"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { supabase } from "@/utils/supabase/client"
import type { Room, Department, Bed, RoomHistoryEvent } from "@/types/rooms"
import { useRooms } from "@/hooks/use-rooms"

interface RoomDetailsDialogProps {
  room: Room
  department?: Department
  onClose: () => void
  onAssignBed: (bedId: string) => void
  onReleaseBed: (bedId: string, notes?: string) => void
}

export function RoomDetailsDialog({ room, department, onClose, onAssignBed, onReleaseBed }: RoomDetailsDialogProps) {
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false)
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null)
  const [releaseNotes, setReleaseNotes] = useState("")
  const [history, setHistory] = useState<RoomHistoryEvent[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false);
  const {getRoomHistory} = useRooms();
  useEffect(() => {
    const fetchRoomHistory = async () => {
      if (!room) return
      
      setLoadingHistory(true)
      try {
        // Use our server action instead of direct Supabase call
        const { history, error } = await getRoomHistory(room.id)
        
        if (error) throw new Error(error)
        
        setHistory(history)
      } catch (error) {
        console.error('Error fetching room history:', error)
      } finally {
        setLoadingHistory(false)
      }
    }
    
    fetchRoomHistory()
  }, [room])
  
  const getBedStatusIcon = (bed: Bed) => {
    if (bed.patientId) {
      return <Badge className="bg-red-500">Occupied</Badge>
    }
    return <Badge className="bg-green-500">Available</Badge>
  }
  
  const handleReleaseDialogOpen = (bedId: string) => {
    setSelectedBedId(bedId)
    setReleaseDialogOpen(true)
  }
  
  const handleConfirmRelease = () => {
    if (selectedBedId) {
      onReleaseBed(selectedBedId, releaseNotes)
      setReleaseDialogOpen(false)
      setReleaseNotes("")
      setSelectedBedId(null)
      onClose()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {room.type} - Room {room.roomNumber}
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
                        <span className="font-medium">Name:</span> {bed.patientName || "Unknown Patient"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Admitted:</span> {bed.admissionDate 
                          ? new Date(bed.admissionDate).toLocaleDateString() 
                          : "N/A"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Expected Discharge:</span> {bed.expectedDischargeDate 
                          ? new Date(bed.expectedDischargeDate).toLocaleDateString() 
                          : "N/A"}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2" 
                        onClick={() => handleReleaseDialogOpen(
                          // Use assignment ID if available, otherwise use bed ID
                          bed.assignmentId ? `assignment-${bed.assignmentId}` : bed.id
                        )}
                      >
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
                  {room.facilities && room.facilities.length > 0 ? (
                    room.facilities.map((facility, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        {facility}
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">No specific facilities listed</li>
                  )}
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
                {loadingHistory ? (
                  <div className="p-3 text-sm text-center">Loading history...</div>
                ) : history && history.length > 0 ? (
                  history.map((event, index) => (
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

      <AlertDialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Bed</AlertDialogTitle>
            <AlertDialogDescription>
              Enter discharge notes (optional)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            placeholder="Enter discharge notes"
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRelease}>Confirm Release</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

