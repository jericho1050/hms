import type { Appointment } from "@/types/appointments";

// Mock patients for the appointment form
export const mockPatients = [
  { id: "P-001", firstName: "John", lastName: "Doe" },
  { id: "P-002", firstName: "Sarah", lastName: "Johnson" },
  { id: "P-003", firstName: "Michael", lastName: "Smith" },
  { id: "P-004", firstName: "Emily", lastName: "Davis" },
  { id: "P-005", firstName: "David", lastName: "Wilson" },
  { id: "P-006", firstName: "Jennifer", lastName: "Brown" },
  { id: "P-007", firstName: "Robert", lastName: "Taylor" },
  { id: "P-008", firstName: "Jessica", lastName: "Martinez" },
  { id: "P-009", firstName: "Christopher", lastName: "Anderson" },
  { id: "P-010", firstName: "Amanda", lastName: "Thomas" },
]

// Mock appointments data
export const mockAppointments: Appointment[] = [
  {
    id: "APP-1001",
    patientId: "P-001",
    patientName: "John Doe",
    doctorId: "D-001",
    doctorName: "James Wilson",
    department: "Cardiology",
    date: new Date().toISOString(),
    startTime: "09:00",
    endTime: "09:30",
    status: "scheduled",
    type: "Regular Checkup",
    notes: "Patient has a history of hypertension. Check blood pressure.",
  },
  {
    id: "APP-1002",
    patientId: "P-002",
    patientName: "Sarah Johnson",
    doctorId: "D-002",
    doctorName: "Emily Rodriguez",
    department: "Neurology",
    date: new Date().toISOString(),
    startTime: "10:00",
    endTime: "10:45",
    status: "checked-in",
    type: "Follow-up",
    notes: "Follow-up for migraines. Discuss medication effectiveness.",
  },
  {
    id: "APP-1003",
    patientId: "P-003",
    patientName: "Michael Smith",
    doctorId: "D-003",
    doctorName: "Robert Chen",
    department: "Endocrinology",
    date: new Date().toISOString(),
    startTime: "11:30",
    endTime: "12:00",
    status: "in-progress",
    type: "Consultation",
    notes: "Diabetes management consultation.",
  },
  {
    id: "APP-1004",
    patientId: "P-004",
    patientName: "Emily Davis",
    doctorId: "D-004",
    doctorName: "Sarah Miller",
    department: "Dermatology",
    date: new Date().toISOString(),
    startTime: "13:15",
    endTime: "13:45",
    status: "completed",
    type: "Procedure",
    notes: "Skin biopsy procedure.",
  },
  {
    id: "APP-1005",
    patientId: "P-005",
    patientName: "David Wilson",
    doctorId: "D-001",
    doctorName: "James Wilson",
    department: "Cardiology",
    date: new Date().toISOString(),
    startTime: "14:30",
    endTime: "15:00",
    status: "no-show",
    type: "Regular Checkup",
    notes: "Annual heart checkup.",
  },
  {
    id: "APP-1006",
    patientId: "P-006",
    patientName: "Jennifer Brown",
    doctorId: "D-005",
    doctorName: "Michael Johnson",
    department: "Psychiatry",
    date: new Date().toISOString(),
    startTime: "15:30",
    endTime: "16:15",
    status: "cancelled",
    type: "Consultation",
    notes: "Initial consultation for anxiety management.",
  },
  {
    id: "APP-1007",
    patientId: "P-007",
    patientName: "Robert Taylor",
    doctorId: "D-006",
    doctorName: "Lisa Wong",
    department: "Orthopedics",
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    startTime: "09:00",
    endTime: "09:45",
    status: "scheduled",
    type: "Follow-up",
    notes: "Post-surgery follow-up for knee replacement.",
  },
  {
    id: "APP-1008",
    patientId: "P-008",
    patientName: "Jessica Martinez",
    doctorId: "D-007",
    doctorName: "David Brown",
    department: "Gynecology",
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    startTime: "10:30",
    endTime: "11:00",
    status: "scheduled",
    type: "Regular Checkup",
    notes: "Annual gynecological exam.",
  },
  {
    id: "APP-1009",
    patientId: "P-009",
    patientName: "Christopher Anderson",
    doctorId: "D-008",
    doctorName: "Jennifer Lee",
    department: "Pulmonology",
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    startTime: "11:30",
    endTime: "12:15",
    status: "scheduled",
    type: "Consultation",
    notes: "Consultation for chronic cough.",
  },
  {
    id: "APP-1010",
    patientId: "P-010",
    patientName: "Amanda Thomas",
    doctorId: "D-009",
    doctorName: "Richard Taylor",
    department: "Ophthalmology",
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    startTime: "14:00",
    endTime: "14:30",
    status: "scheduled",
    type: "Regular Checkup",
    notes: "Annual eye exam.",
  },
  {
    id: "APP-1011",
    patientId: "P-001",
    patientName: "John Doe",
    doctorId: "D-010",
    doctorName: "Patricia Martinez",
    department: "Nephrology",
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    startTime: "09:30",
    endTime: "10:15",
    status: "scheduled",
    type: "Consultation",
    notes: "Consultation for kidney function.",
  },
  {
    id: "APP-1012",
    patientId: "P-003",
    patientName: "Michael Smith",
    doctorId: "D-003",
    doctorName: "Robert Chen",
    department: "Endocrinology",
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    startTime: "11:00",
    endTime: "11:30",
    status: "scheduled",
    type: "Follow-up",
    notes: "Follow-up for diabetes management.",
  },
  {
    id: "APP-1013",
    patientId: "P-005",
    patientName: "David Wilson",
    doctorId: "D-011",
    doctorName: "Susan White",
    department: "Gastroenterology",
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    startTime: "10:00",
    endTime: "10:45",
    status: "scheduled",
    type: "Procedure",
    notes: "Endoscopy procedure.",
  },
  {
    id: "APP-1014",
    patientId: "P-007",
    patientName: "Robert Taylor",
    doctorId: "D-012",
    doctorName: "Thomas Harris",
    department: "Urology",
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    startTime: "13:30",
    endTime: "14:00",
    status: "scheduled",
    type: "Consultation",
    notes: "Consultation for urinary issues.",
  },
  {
    id: "APP-1015",
    patientId: "P-009",
    patientName: "Christopher Anderson",
    doctorId: "D-013",
    doctorName: "Elizabeth Clark",
    department: "Rheumatology",
    date: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
    startTime: "09:15",
    endTime: "10:00",
    status: "scheduled",
    type: "Follow-up",
    notes: "Follow-up for arthritis management.",
  },
]

