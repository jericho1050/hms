import { vi } from 'vitest';

// Mock appointment data
export const mockAppointments = [
  {
    id: '1',
    patientId: 'p1',
    patientName: 'John Doe',
    doctorId: 'd1',
    doctorName: 'Dr. Smith',
    department: 'cardiology',
    date: '2023-05-01',
    startTime: '09:00',
    endTime: '10:00',
    status: 'scheduled',
    type: 'Regular Checkup',
    notes: 'First appointment'
  },
  {
    id: '2',
    patientId: 'p2',
    patientName: 'Jane Smith',
    doctorId: 'd2',
    doctorName: 'Dr. Johnson',
    department: 'neurology',
    date: '2023-05-02',
    startTime: '10:00',
    endTime: '11:00',
    status: 'completed',
    type: 'Follow-up',
    notes: 'Follow-up appointment'
  }
];

// Mock dashboard view data (matches the structure from the database view)
export const mockDashboardViewData = mockAppointments.map(app => ({
  id: app.id,
  patientid: app.patientId,
  patientname: app.patientName,
  doctorid: app.doctorId,
  doctorname: app.doctorName,
  department: app.department,
  date: app.date,
  starttime: app.startTime,
  endtime: app.endTime,
  status: app.status,
  type: app.type,
  notes: app.notes
}));

// Mock response for insert
export const mockInsertResponse = {
  data: [{
    id: '3',
    patient_id: 'p3',
    staff_id: 'd1',
    appointment_date: '2023-05-03',
    start_time: '11:00',
    end_time: '12:00',
    status: 'scheduled',
    appointment_type: 'Consultation',
    notes: 'New consultation',
    reason: null,
    room_number: null
  }],
  error: null
};

// Mock response for update
export const mockUpdateResponse = {
  data: [{
    id: '1',
    patient_id: 'p1',
    staff_id: 'd1',
    appointment_date: '2023-05-01',
    start_time: '09:00',
    end_time: '10:00',
    status: 'completed', // Updated status
    appointment_type: 'Regular Checkup',
    notes: 'First appointment',
    reason: null,
    room_number: null
  }],
  error: null
};

// Mock hook imports
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn().mockReturnValue({ id: 'toast-1', update: vi.fn() })
  })
}));

// Mock the Supabase client module
vi.mock('@/utils/supabase/client', () => {
  // Create a function that returns a simple mock for each Supabase method
  const createSupabaseMock = () => {
    return {
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockResolvedValue({ data: [], error: null })
        })),
        update: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            select: vi.fn().mockResolvedValue({ data: [], error: null })
          }))
        })),
        eq: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockResolvedValue({ data: [], error: null })
        })),
        ilike: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      }))
    };
  };

  return {
    supabase: createSupabaseMock()
  };
}); 