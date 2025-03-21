import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppointments } from '@/hooks/use-appointments';
import { mockDashboardViewData } from '../appointment-test/mocks';

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



    describe('getAppointmentsForDate', () => {
      it('should filter appointments by date', async () => {
        // Setup dates for testing
        const testDate = new Date('2023-05-15');
        
        // Create appointments with different dates
        const mockDataWithDates = [
          { id: '1', date: '2023-05-15T00:00:00.000Z', patientid: 'p1', patientname: 'John' },
          { id: '2', date: '2023-05-15T12:00:00.000Z', patientid: 'p2', patientname: 'Jane' },
          { id: '3', date: '2023-05-16T00:00:00.000Z', patientid: 'p3', patientname: 'Bob' }
        ];
        
        // Setup mock to return appointments with dates
        mockSelect.mockResolvedValue({
          data: mockDataWithDates,
          error: null
        });
        
        // Render the hook
        const { result } = renderHook(() => useAppointments());
        
        // Load appointments
        await act(async () => {
          await result.current.fetchAppointments();
        });
        
        // Get appointments for the test date
        const filteredAppointments = result.current.getAppointmentsForDate(testDate);
        
        // Should return the two appointments for May 15
        expect(filteredAppointments.length).toBe(2);
        expect(filteredAppointments.map(a => a.id)).toEqual(['1', '2']);
      });
    });

    describe('stats calculation', () => {
      it('should calculate stats based on appointments', async () => {
        // Create a fixed date for testing
        const mockToday = '2023-05-15';
        
        // Spy on Date.prototype.toISOString to return fixed date
        vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(`${mockToday}T00:00:00.000Z`);
        
        // Create mock appointments with various statuses
        const mockAppointmentsWithStatus = [
          { id: '1', date: mockToday, status: 'completed', patientid: 'p1', patientname: 'John' },
          { id: '2', date: mockToday, status: 'scheduled', patientid: 'p2', patientname: 'Jane' },
          { id: '3', date: mockToday, status: 'no-show', patientid: 'p3', patientname: 'Bob' },
          { id: '4', date: mockToday, status: 'in-progress', patientid: 'p4', patientname: 'Alice' },
          { id: '5', date: '2023-05-16', status: 'scheduled', patientid: 'p5', patientname: 'Charlie' }
        ];
        
        // Setup mock to return appointments with status
        mockSelect.mockResolvedValue({
          data: mockAppointmentsWithStatus,
          error: null
        });
        
        // Render the hook
        const { result } = renderHook(() => useAppointments());
        
        // Load appointments to trigger stats calculation
        await act(async () => {
          await result.current.fetchAppointments();
        });
        
        // Verify stats calculation
        expect(result.current.stats.totalToday).toBe(4); // 4 appointments for today
        expect(result.current.stats.noShows).toBe(1);
        expect(result.current.stats.pending).toBe(3); // 'scheduled' and 'in-progress'
        
        // Restore the original implementation
        vi.restoreAllMocks();
      });
    });
  });
});