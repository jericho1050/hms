"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { CalendarIcon, Search, Loader2 } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import type { Room } from "@/types/rooms"

// Custom debounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  
  return debouncedValue
}

interface Patient {
  id: string
  name: string
}

interface AssignBedDialogProps {
  roomId: string
  bedId: string
  room?: Room
  onClose: () => void
  onAssign: (patientId: string, admissionDate: string, expectedDischargeDate?: string, isEmergency?: boolean) => void
}

export function AssignBedDialog({ roomId, bedId, room, onClose, onAssign }: AssignBedDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [admissionDate, setAdmissionDate] = useState<Date | undefined>(new Date())
  const [expectedDischargeDate, setExpectedDischargeDate] = useState<Date | undefined>(undefined)
  const [isEmergency, setIsEmergency] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  
  // Debounce the search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Function to fetch patients
  const fetchPatients = useCallback(async (query: string = "") => {
    try {
      setLoading(true)
      let patientsQuery = supabase
        .from('patients')
        .select('id, first_name, last_name')
        .limit(100)

      if (query.length >= 2) {
        // Only apply filter if we have a search query
        patientsQuery = patientsQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      }
      
      const { data, error } = await patientsQuery
      
      if (error) throw error
      
      const formattedPatients = data.map(patient => ({
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`
      }))
      
      setPatients(formattedPatients)
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [])

  // Load initial patients when component mounts
  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])
  
  // React to changes in the debounced search query
  useEffect(() => {
    if (debouncedSearchQuery !== "") {
      fetchPatients(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, fetchPatients])

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Get the bed number from the virtual bed ID
  const bedNumber = parseInt(bedId.split('-bed-')[1])
  const bed = room?.beds.find((b) => b.id === bedId)

  const handleAssign = () => {
    if (selectedPatientId) {
      const formattedAdmissionDate = admissionDate 
        ? format(admissionDate, "yyyy-MM-dd'T'HH:mm:ss") 
        : format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
      
      const formattedDischargeDate = expectedDischargeDate 
        ? format(expectedDischargeDate, "yyyy-MM-dd'T'HH:mm:ss") 
        : undefined
      
      onAssign(
        selectedPatientId, 
        formattedAdmissionDate, 
        formattedDischargeDate,
        isEmergency
      )
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Patient to Bed</DialogTitle>
          <DialogDescription>
            {room?.name} - Room {room?.roomNumber}{bed?.name ? `, ${bed.name}` : `, Bed ${bedNumber}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="patient-search">Search Patient</Label>
            <div className="relative">
              {loading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
              {!loading && <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />}
              <Input
                id="patient-search"
                type="search"
                placeholder="Search by name..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient-select">Select Patient</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger id="patient-select">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {initialLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Loading patients...
                    </div>
                  </SelectItem>
                ) : patients.length > 0 ? (
                  patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="not-found" disabled>No patients found</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {patients.length > 0 && !initialLoading ? 
                `Showing ${patients.length} patient${patients.length === 1 ? '' : 's'}` : 
                ''}
            </p>
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

