import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppointments } from '@/hooks/use-appointments';
import { mockDashboardViewData } from './mocks';

// Define the mocks before vi.mock
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelectAfterInsert = vi.fn();

// Define the mock structure - this gets hoisted to the top
vi.mock('@/utils/supabase/client', () => {
  return {
    supabase: {
      from: () => ({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate
      })
    }
  };
});

describe('useAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockSelect.mockResolvedValue({ data: [], error: null });
    mockSelectAfterInsert.mockResolvedValue({ data: [], error: null });
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ data: [], error: null });
  });

  describe('fetchAppointments', () => {
    it('should fetch and format appointments', async () => {
      // Setup mock to return test data
      mockSelect.mockResolvedValue({ 
        data: mockDashboardViewData,
        error: null
      });

      // Render the hook
      const { result } = renderHook(() => useAppointments());
      
      // Initial state
      expect(result.current.isLoading).toBe(true);
      
      // Call fetchAppointments
      await act(async () => {
        await result.current.fetchAppointments();
      });
      
      // Verify the hook state was updated
      expect(result.current.isLoading).toBe(false);
      expect(result.current.appointments.length).toBe(mockDashboardViewData.length);
      
      // Verify the Supabase client was called correctly
      expect(mockSelect).toHaveBeenCalledWith('*');
    });
  });

  describe('handleNewAppointment', () => {
    it('should create a new appointment', async () => {
      // Setup mock response for insert
      const mockInsertResponse = { 
        data: [{ id: 'new-appointment-id', patient_id: 'p1', staff_id: 'd1' }], 
        error: null 
      };
      
      mockSelectAfterInsert.mockResolvedValue(mockInsertResponse);
      
      // Render the hook
      const { result } = renderHook(() => useAppointments());
      
      // New appointment data
      const newAppointment = {
        patientId: 'p1',
        patientName: 'John Doe',
        doctorId: 'd1',
        doctorName: 'Dr. Smith',
        department: 'Cardiology',
        date: '2023-05-15', // Changed from Date object to string
        startTime: '09:00',
        endTime: '10:00',
        type: 'Regular Checkup',
        notes: 'Test notes'
      };
      
      // Call handleNewAppointment
      await act(async () => {
        await result.current.handleNewAppointment(newAppointment);
      });
      
      // Verify the appointment data was formatted correctly for the database
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        patient_id: 'p1',
        staff_id: 'd1',
        appointment_type: 'Regular Checkup',
      }));
    });
  });
});