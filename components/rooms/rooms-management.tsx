"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BedIcon, Filter, Search, UserPlus, Users } from "lucide-react"
import { RoomDetailsDialog } from "@/components/rooms/room-details-dialog"
import { AssignBedDialog } from "@/components/rooms/assign-bed-dialog"
import type { Room, Department, RoomStatus } from "@/types/rooms"
import { assignBedToPatient, releaseBed } from "@/app/actions/rooms"
import { useToast } from "@/hooks/use-toast"
import { useStaff } from "@/hooks/use-staff"
import { X } from "lucide-react"
import { useRooms } from "@/hooks/use-rooms"

interface RoomsManagementProps {
  initialRooms: Room[]
  initialDepartments: Department[]
}

export function RoomsManagement() {
  const {
    rooms,
    setRooms,
    departments,
    setDepartments,
    isLoading,
    error,
    getRoomsData,
    getDepartmentsData,
    getPatientsData,
    getRoomHistory,
  } = useRooms()

  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedBed, setSelectedBed] = useState<{ roomId: string; bedId: string } | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showPatientPlacementDialog, setShowPatientPlacementDialog] = useState(false)
  const {staffId} = useStaff();
  const { toast } = useToast()

  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    available: 0,
    partial: 0,
    full: 0,
    total: 0,
    occupancyRate: 0,
  })

  useEffect(() => {
    // Calculate initial status counts
    calculateStatusCounts(rooms)
  }, [rooms])

  useEffect(() => {
    // Filter rooms based on department and search query
    let filtered = [...rooms]

    if (selectedDepartment !== "all") {
      filtered = filtered.filter((room) => room.departmentId === selectedDepartment)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (room) => {
          // Check if room type or number matches (keep existing functionality)
          const roomType = room?.type?.toLowerCase() || '';
          const roomNumber = room?.roomNumber?.toLowerCase() || '';
          const roomMatches = roomType.includes(query) || roomNumber.includes(query);
          
          // Check if any patient in this room's beds matches the search
          const patientMatches = room.beds.some(bed => {
            // Search in patient name if available
            const patientName = bed?.patientName?.toLowerCase() || '';
            
            // Also check patient ID as fallback
            const patientId = bed?.patientId?.toLowerCase() || '';
            
            return patientName.includes(query) || patientId.includes(query);
          });
          
          // Return true if either room or any patient matches
          return roomMatches || patientMatches;
        }
      )
    }

    setFilteredRooms(filtered)
    calculateStatusCounts(filtered)
  }, [selectedDepartment, searchQuery, rooms])

  const calculateStatusCounts = (roomsToCount: Room[]) => {
    let available = 0
    let partial = 0
    let full = 0
    let totalBeds = 0
    let occupiedBeds = 0

    roomsToCount.forEach((room) => {
      const totalRoomBeds = room.beds.length
      const occupiedRoomBeds = room.beds.filter((bed) => bed.patientId).length

      totalBeds += totalRoomBeds
      occupiedBeds += occupiedRoomBeds

      if (occupiedRoomBeds === 0) {
        available++
      } else if (occupiedRoomBeds < totalRoomBeds) {
        partial++
      } else {
        full++
      }
    })

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

    setStatusCounts({
      available,
      partial,
      full,
      total: roomsToCount.length,
      occupancyRate,
    })
  }

  const handleAssignBed = async (roomId: string, bedId: string, patientId: string, patientName:string | undefined, admissionDate: string, expectedDischargeDate?: string, isEmergency: boolean = false) => {
    try {
      const assignedBy = staffId || "00000000-0000-0000-0000-000000000000"
      
      // Call server action
      const result = await assignBedToPatient(
        roomId,
        bedId,
        patientId,
        assignedBy,
        admissionDate,
        expectedDischargeDate,
        isEmergency
      )
      
      if (result.success) {
        // Update local state optimistically
        const updatedRooms = rooms.map((room) => {
          if (room.id === roomId) {
            const updatedBeds = room.beds.map((bed) => {
              if (bed.id === bedId) {
                return { 
                  ...bed, 
                  patientName,
                  patientId,
                  admissionDate,
                  expectedDischargeDate
                }
              }
              return bed
            })
  
            // Recalculate room status
            const occupiedBeds = updatedBeds.filter((bed) => bed.patientId).length
            let status: RoomStatus = "available"
  
            if (occupiedBeds === updatedBeds.length) {
              status = "full"
            } else if (occupiedBeds > 0) {
              status = "partial"
            }
  
            return { ...room, beds: updatedBeds, status }
          }
          return room
        })
  
        setRooms(updatedRooms)
        toast({
          title: "Bed assigned successfully",
          description: "The patient has been assigned to the bed.",
          variant: "default",
        })
        
        // Return the updated room for immediate use
        return updatedRooms.find(room => room.id === roomId)
      } else {
        toast({
          title: "Error assigning bed",
          description: result.error || "Something went wrong.",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      toast({
        title: "Error assigning bed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
      return null
    } finally {
      setSelectedBed(null)
    }
  }
  
  const handleReleaseBed = async (roomId: string, bedId: string, notes?: string) => {
    try {
      // Get current user info - in a real app this would come from auth
      const releasedBy = "Current User"
      
      // Call server action
      const result = await releaseBed(roomId, bedId, releasedBy, notes)
      
      if (result.success) {
        // Update local state optimistically
        const updatedRooms = rooms.map((room) => {
          if (room.id === roomId) {
            const updatedBeds = room.beds.map((bed) => {
              if (bed.id === bedId) {
                return { 
                  ...bed, 
                  patientId: null,
                  admissionDate: undefined,
                  expectedDischargeDate: undefined
                }
              }
              return bed
            })
  
            // Recalculate room status
            const occupiedBeds = updatedBeds.filter((bed) => bed.patientId).length
            let status: RoomStatus = "available"
  
            if (occupiedBeds === updatedBeds.length) {
              status = "full"
            } else if (occupiedBeds > 0) {
              status = "partial"
            }
  
            return { ...room, beds: updatedBeds, status }
          }
          return room
        })
  
        setRooms(updatedRooms)
        
        // Return the updated room for immediate use
        return updatedRooms.find(room => room.id === roomId)
      } else {
        toast({
          title: "Error releasing bed",
          description: result.error || "Something went wrong.",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      toast({
        title: "Error releasing bed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
      return null
    }
  }

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "partial":
        return "bg-yellow-500"
      case "full":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
      case "partial":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Partially Occupied</Badge>
      case "full":
        return <Badge className="bg-red-500 hover:bg-red-600">Full</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const viewAvailableBeds = () => {
    // Filter to show only rooms with available beds
    const roomsWithAvailableBeds = rooms.filter(room => 
      room.status === "available" || room.status === "partial"
    );
    
    setFilteredRooms(roomsWithAvailableBeds);
    setSelectedDepartment("all");
    setSearchQuery("");
    
    toast({
      title: "Available beds",
      description: `Showing ${roomsWithAvailableBeds.length} rooms with available beds.`,
      variant: "default",
    });
  }
  
  const openPatientPlacement = () => {
    // Either open a dialog or navigate to patient placement view
    setShowPatientPlacementDialog(true);
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Occupancy Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statusCounts.occupancyRate}%</div>
            <Progress value={statusCounts.occupancyRate} className="h-2 mt-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {statusCounts.total} rooms, {statusCounts.available + statusCounts.partial} with availability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Room Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Available: {statusCounts.available}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Partial: {statusCounts.partial}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Full: {statusCounts.full}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline" onClick={viewAvailableBeds}>
              <BedIcon className="mr-2 h-4 w-4" />
              View All Available Beds
            </Button>
            <Button className="w-full" variant="outline" onClick={openPatientPlacement}>
              <Users className="mr-2 h-4 w-4" />
              Patient Placement
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]"  data-testid="department-select">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rooms..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Rooms Display */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room) => {
            const department = departments.find((d) => d.id === room.departmentId)
            const occupiedBeds = room.beds.filter((bed) => bed.patientId).length

            return (
              <Card key={room.id} className="overflow-hidden">
                <div className={`h-1 w-full ${getStatusColor(room.status)}`} />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{room.type}</CardTitle>
                      <CardDescription>Room {room.roomNumber}</CardDescription>
                    </div>
                    {getStatusBadge(room.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Department:</span> {department?.name}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Beds:</span> {occupiedBeds}/{room.beds.length} occupied
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Floor:</span> {room.floor}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setSelectedRoom(room)}>
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={room.status === "full"}
                    onClick={() => {
                      const availableBed = room.beds.find((bed) => !bed.patientId)
                      if (availableBed) {
                        setSelectedBed({ roomId: room.id, bedId: availableBed.id })
                      }
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Bed
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="grid grid-cols-12 p-4 font-medium border-b">
            <div className="col-span-3">Room</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Beds</div>
            <div className="col-span-3">Actions</div>
          </div>
          {filteredRooms.map((room) => {
            const department = departments.find((d) => d.id === room.departmentId)
            const occupiedBeds = room.beds.filter((bed) => bed.patientId).length

            return (
              <div key={room.id} className="grid grid-cols-12 p-4 border-b items-center">
                <div className="col-span-3">
                  <div className="font-medium">{room.type}</div>
                  <div className="text-sm text-muted-foreground">
                    Room {room.roomNumber}, Floor {room.floor}
                  </div>
                </div>
                <div className="col-span-2">{department?.name}</div>
                <div className="col-span-2">{getStatusBadge(room.status)}</div>
                <div className="col-span-2">
                  {occupiedBeds}/{room.beds.length} occupied
                </div>
                <div className="col-span-3 flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedRoom(room)}>
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={room.status === "full"}
                    onClick={() => {
                      const availableBed = room.beds.find((bed) => !bed.patientId)
                      if (availableBed) {
                        setSelectedBed({ roomId: room.id, bedId: availableBed.id })
                      }
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Room Details Dialog */}
      {selectedRoom && (
        <RoomDetailsDialog
          room={selectedRoom}
          department={departments.find((d) => d.id === selectedRoom.departmentId)}
          onClose={() => setSelectedRoom(null)}
          onAssignBed={(bedId) => {
            setSelectedBed({ roomId: selectedRoom.id, bedId })
            setSelectedRoom(null)
          }}
          onReleaseBed={(bedId, notes) => {
            handleReleaseBed(selectedRoom.id, bedId, notes).then(updatedRoom => {
              if (updatedRoom) {
                setSelectedRoom(updatedRoom);
              }
            });
          }}
          getRoomHistory={getRoomHistory}
        />
      )}

      {/* Assign Bed Dialog */}
      {selectedBed && (
        <AssignBedDialog
          roomId={selectedBed.roomId}
          bedId={selectedBed.bedId}
          room={rooms.find((r) => r.id === selectedBed.roomId)}
          onClose={() => setSelectedBed(null)}
          onAssign={(patientId, patientName, admissionDate, expectedDischargeDate, isEmergency) => 
            handleAssignBed(
              selectedBed.roomId, 
              selectedBed.bedId, 
              patientId, 
              patientName,
              admissionDate,
              expectedDischargeDate,
              isEmergency
            )
          }
        />
      )}

      {/* Patient Placement Dialog */}
      {showPatientPlacementDialog && (
        <PatientPlacementDialog
          departments={departments}
          rooms={rooms}
          onClose={() => setShowPatientPlacementDialog(false)}
          onSelectBed={(roomId, bedId) => {
            setSelectedBed({ roomId, bedId });
            setShowPatientPlacementDialog(false);
          }}
        />
      )}
    </div>
  )
}

// Patient Placement Dialog Component
interface PatientPlacementDialogProps {
  departments: Department[]
  rooms: Room[]
  onClose: () => void
  onSelectBed: (roomId: string, bedId: string) => void
}

function PatientPlacementDialog({ departments, rooms, onClose, onSelectBed }: PatientPlacementDialogProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all")
  
  // Get available room types
  const roomTypes = Array.from(new Set(rooms.map(room => room.type)))
  
  // Filter available rooms based on criteria
  const availableRooms = rooms.filter(room => {
    if (selectedDepartment !== "all" && room.departmentId !== selectedDepartment) return false
    if (selectedRoomType !== "all" && room.type !== selectedRoomType) return false
    // Must have at least one available bed
    return room.beds.some(bed => !bed.patientId)
  })
  
  // Helper function for status badges
  const getStatusBadgeForDialog = (status: RoomStatus) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
      case "partial":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Partially Occupied</Badge>
      case "full":
        return <Badge className="bg-red-500 hover:bg-red-600">Full</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Patient Placement</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">Department</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Room Type</label>
            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Available Rooms</h3>
          {availableRooms.length === 0 ? (
            <p className="text-muted-foreground">No rooms match your criteria.</p>
          ) : (
            <div className="space-y-3">
              {availableRooms.map(room => {
                const department = departments.find(d => d.id === room.departmentId)
                const availableBeds = room.beds.filter(bed => !bed.patientId)
                
                return (
                  <div key={room.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{room.type} - Room {room.roomNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          {department?.name}, Floor {room.floor}
                        </p>
                      </div>
                      {getStatusBadgeForDialog(room.status)}
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Available Beds ({availableBeds.length})</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {availableBeds.map(bed => (
                          <Button 
                            key={bed.id}
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => onSelectBed(room.id, bed.id)}
                          >
                            <BedIcon className="mr-2 h-4 w-4" />
                            {bed.id.substring(0, 4)} {/* Using bed id substring instead of bedNumber */}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

