"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"
import { getPatients } from "@/lib/mock-patients"
import type { Room } from "@/types/rooms"

interface AssignBedDialogProps {
  roomId: string
  bedId: string
  room?: Room
  onClose: () => void
  onAssign: (patientId: string) => void
}

export function AssignBedDialog({ roomId, bedId, room, onClose, onAssign }: AssignBedDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [admissionDate, setAdmissionDate] = useState<Date | undefined>(new Date())
  const [expectedDischargeDate, setExpectedDischargeDate] = useState<Date | undefined>(undefined)
  const [isEmergency, setIsEmergency] = useState(false)

  const patients = getPatients()
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const bed = room?.beds.find((b) => b.id === bedId)

  const handleAssign = () => {
    if (selectedPatientId) {
      onAssign(selectedPatientId)
      onClose()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Patient to Bed</DialogTitle>
          <DialogDescription>
            {room?.name} - Room {room?.roomNumber}, {bed?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="patient-search">Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="patient-search"
                type="search"
                placeholder="Search by name or ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient-select">Select Patient</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger id="patient-select">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {filteredPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Admission Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {admissionDate ? format(admissionDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={admissionDate} onSelect={setAdmissionDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Expected Discharge Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedDischargeDate ? format(expectedDischargeDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expectedDischargeDate}
                    onSelect={setExpectedDischargeDate}
                    initialFocus
                    disabled={(date) => date < (admissionDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="emergency"
              checked={isEmergency}
              onCheckedChange={(checked) => setIsEmergency(checked === true)}
            />
            <Label htmlFor="emergency">Emergency Admission</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedPatientId}>
            Assign Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

