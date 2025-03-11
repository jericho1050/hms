export type RoomStatus = "available" | "partial" | "full"

export interface Bed {
  id: string
  name: string
  type: string
  patientId: string | null
  admissionDate?: string
  expectedDischargeDate?: string
}

export interface RoomHistoryEvent {
  action: string
  timestamp: string
  user: string
}

export interface Room {
  id: string
  name: string
  roomNumber: string
  type: string
  departmentId: string
  floor: string
  wing: string
  status: RoomStatus
  facilities: string[]
  notes?: string
  beds: Bed[]
  history?: RoomHistoryEvent[]
}

export interface Department {
  id: string
  name: string
  color: string
}

