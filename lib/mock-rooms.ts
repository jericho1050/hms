import type { Room, Department } from "@/types/rooms"

export function getRooms(): Room[] {
  return [
    {
      id: "room-001",
      name: "General Ward A",
      roomNumber: "101",
      type: "General Ward",
      departmentId: "dept-001",
      floor: "1",
      wing: "East",
      status: "partial",
      facilities: ["Oxygen Supply", "Call Button", "Television"],
      notes: "Recently renovated in January 2023.",
      beds: [
        {
          id: "bed-001",
          name: "Bed 1",
          type: "Standard",
          patientId: "patient-001",
          admissionDate: "2023-03-15",
          expectedDischargeDate: "2023-03-20",
        },
        {
          id: "bed-002",
          name: "Bed 2",
          type: "Standard",
          patientId: null,
        },
        {
          id: "bed-003",
          name: "Bed 3",
          type: "Standard",
          patientId: "patient-002",
          admissionDate: "2023-03-17",
          expectedDischargeDate: "2023-03-22",
        },
        {
          id: "bed-004",
          name: "Bed 4",
          type: "Standard",
          patientId: null,
        },
      ],
      history: [
        {
          action: "Patient John Doe admitted to Bed 1",
          timestamp: "2023-03-15 09:30 AM",
          user: "Dr. Sarah Johnson",
        },
        {
          action: "Patient Jane Smith admitted to Bed 3",
          timestamp: "2023-03-17 11:15 AM",
          user: "Dr. Michael Brown",
        },
      ],
    },
    {
      id: "room-002",
      name: "ICU Room 1",
      roomNumber: "201",
      type: "Intensive Care",
      departmentId: "dept-002",
      floor: "2",
      wing: "North",
      status: "full",
      facilities: ["Ventilator", "Cardiac Monitor", "Dialysis Access", "Isolation Capability"],
      notes: "High-priority ICU room with advanced monitoring equipment.",
      beds: [
        {
          id: "bed-005",
          name: "ICU Bed 1",
          type: "ICU",
          patientId: "patient-003",
          admissionDate: "2023-03-16",
          expectedDischargeDate: "2023-03-25",
        },
        {
          id: "bed-006",
          name: "ICU Bed 2",
          type: "ICU",
          patientId: "patient-004",
          admissionDate: "2023-03-18",
          expectedDischargeDate: "2023-03-28",
        },
      ],
      history: [
        {
          action: "Patient Robert Johnson admitted to ICU Bed 1",
          timestamp: "2023-03-16 14:45 PM",
          user: "Dr. Emily Chen",
        },
        {
          action: "Patient Maria Garcia admitted to ICU Bed 2",
          timestamp: "2023-03-18 08:20 AM",
          user: "Dr. James Wilson",
        },
      ],
    },
    {
      id: "room-003",
      name: "Pediatric Room A",
      roomNumber: "301",
      type: "Pediatric",
      departmentId: "dept-003",
      floor: "3",
      wing: "West",
      status: "available",
      facilities: ["Child-friendly Décor", "Parent Accommodation", "Oxygen Supply", "Television"],
      notes: "Designed for children with space for parents to stay overnight.",
      beds: [
        {
          id: "bed-007",
          name: "Pediatric Bed 1",
          type: "Pediatric",
          patientId: null,
        },
        {
          id: "bed-008",
          name: "Pediatric Bed 2",
          type: "Pediatric",
          patientId: null,
        },
      ],
      history: [
        {
          action: "Room cleaned and prepared for new patients",
          timestamp: "2023-03-18 16:30 PM",
          user: "Housekeeping Staff",
        },
      ],
    },
    {
      id: "room-004",
      name: "Maternity Suite 1",
      roomNumber: "401",
      type: "Maternity",
      departmentId: "dept-004",
      floor: "4",
      wing: "South",
      status: "partial",
      facilities: ["Birthing Equipment", "Neonatal Care Unit", "Private Bathroom", "Family Area"],
      notes: "Spacious maternity suite with facilities for family members.",
      beds: [
        {
          id: "bed-009",
          name: "Maternity Bed 1",
          type: "Maternity",
          patientId: "patient-005",
          admissionDate: "2023-03-19",
          expectedDischargeDate: "2023-03-21",
        },
        {
          id: "bed-010",
          name: "Maternity Bed 2",
          type: "Maternity",
          patientId: null,
        },
      ],
      history: [
        {
          action: "Patient Lisa Thompson admitted to Maternity Bed 1",
          timestamp: "2023-03-19 10:15 AM",
          user: "Dr. Amanda Rodriguez",
        },
      ],
    },
    {
      id: "room-005",
      name: "Surgical Recovery Room",
      roomNumber: "501",
      type: "Post-Op",
      departmentId: "dept-005",
      floor: "5",
      wing: "East",
      status: "partial",
      facilities: ["Vital Monitors", "Oxygen Supply", "Pain Management System"],
      notes: "Dedicated for post-surgical recovery with specialized monitoring.",
      beds: [
        {
          id: "bed-011",
          name: "Recovery Bed 1",
          type: "Post-Op",
          patientId: "patient-006",
          admissionDate: "2023-03-19",
          expectedDischargeDate: "2023-03-22",
        },
        {
          id: "bed-012",
          name: "Recovery Bed 2",
          type: "Post-Op",
          patientId: null,
        },
        {
          id: "bed-013",
          name: "Recovery Bed 3",
          type: "Post-Op",
          patientId: "patient-007",
          admissionDate: "2023-03-20",
          expectedDischargeDate: "2023-03-23",
        },
      ],
      history: [
        {
          action: "Patient David Wilson transferred to Recovery Bed 1 after surgery",
          timestamp: "2023-03-19 15:40 PM",
          user: "Dr. Thomas Lee",
        },
        {
          action: "Patient Susan Miller transferred to Recovery Bed 3 after surgery",
          timestamp: "2023-03-20 11:25 AM",
          user: "Dr. Thomas Lee",
        },
      ],
    },
    {
      id: "room-006",
      name: "Private Room 1",
      roomNumber: "601",
      type: "Private",
      departmentId: "dept-001",
      floor: "6",
      wing: "North",
      status: "available",
      facilities: ["Private Bathroom", "Television", "Mini Fridge", "Visitor Seating"],
      notes: "Premium private room with additional amenities for comfort.",
      beds: [
        {
          id: "bed-014",
          name: "Private Bed",
          type: "Deluxe",
          patientId: null,
        },
      ],
      history: [
        {
          action: "Room deep cleaned and prepared for new patient",
          timestamp: "2023-03-20 09:00 AM",
          user: "Housekeeping Staff",
        },
      ],
    },
    {
      id: "room-007",
      name: "Psychiatric Ward Room 1",
      roomNumber: "701",
      type: "Psychiatric",
      departmentId: "dept-006",
      floor: "7",
      wing: "West",
      status: "partial",
      facilities: ["Secure Environment", "Observation Window", "Therapeutic Space"],
      notes: "Designed for psychiatric patients with safety features.",
      beds: [
        {
          id: "bed-015",
          name: "Psychiatric Bed 1",
          type: "Psychiatric",
          patientId: "patient-008",
          admissionDate: "2023-03-15",
          expectedDischargeDate: "2023-03-30",
        },
        {
          id: "bed-016",
          name: "Psychiatric Bed 2",
          type: "Psychiatric",
          patientId: null,
        },
      ],
      history: [
        {
          action: "Patient Kevin Brown admitted to Psychiatric Bed 1",
          timestamp: "2023-03-15 13:20 PM",
          user: "Dr. Patricia White",
        },
      ],
    },
    {
      id: "room-008",
      name: "Oncology Room A",
      roomNumber: "801",
      type: "Oncology",
      departmentId: "dept-007",
      floor: "8",
      wing: "South",
      status: "full",
      facilities: ["Chemotherapy Access", "Radiation Protection", "Comfort Amenities"],
      notes: "Specialized for cancer patients undergoing treatment.",
      beds: [
        {
          id: "bed-017",
          name: "Oncology Bed 1",
          type: "Oncology",
          patientId: "patient-009",
          admissionDate: "2023-03-10",
          expectedDischargeDate: "2023-03-25",
        },
        {
          id: "bed-018",
          name: "Oncology Bed 2",
          type: "Oncology",
          patientId: "patient-010",
          admissionDate: "2023-03-12",
          expectedDischargeDate: "2023-03-27",
        },
      ],
      history: [
        {
          action: "Patient Richard Davis admitted to Oncology Bed 1",
          timestamp: "2023-03-10 10:30 AM",
          user: "Dr. Nancy Taylor",
        },
        {
          action: "Patient Jennifer Martinez admitted to Oncology Bed 2",
          timestamp: "2023-03-12 14:15 PM",
          user: "Dr. Nancy Taylor",
        },
      ],
    },
  ]
}

export function getDepartments(): Department[] {
  return [
    {
      id: "dept-001",
      name: "General Medicine",
      color: "#4CAF50",
    },
    {
      id: "dept-002",
      name: "Intensive Care",
      color: "#F44336",
    },
    {
      id: "dept-003",
      name: "Pediatrics",
      color: "#2196F3",
    },
    {
      id: "dept-004",
      name: "Obstetrics & Gynecology",
      color: "#FF9800",
    },
    {
      id: "dept-005",
      name: "Surgery",
      color: "#9C27B0",
    },
    {
      id: "dept-006",
      name: "Psychiatry",
      color: "#607D8B",
    },
    {
      id: "dept-007",
      name: "Oncology",
      color: "#795548",
    },
  ]
}

