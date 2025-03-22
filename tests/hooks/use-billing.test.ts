import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useBilling } from '@/hooks/use-billing';
import { BillingFormData, BillingFilter } from '@/types/billing';

// Mock the Supabase client with better chain handling
vi.mock('@/utils/supabase/client', () => {
  // Create a chainable mock function that returns itself for any method call
  const createChainableMock = () => {
    const mock = {};
    const handler = {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          // Return a new proxy for any method access
          return (...args: any[]) => {
            // Store the last called method and args
            mock.lastMethod = prop;
            mock.lastArgs = args;
            // Return the same proxy to allow chaining
            return new Proxy(mock, handler);
          };
        }
        return Reflect.get(target, prop);
      }
    };
    return new Proxy(mock, handler);
  };

  return {
    supabase: {
      from: vi.fn().mockImplementation(() => {
        const chainMock = createChainableMock();
        // Add a mock implementation for the final query result
        Object.defineProperty(chainMock, 'then', {
          value: (callback: Function) => {
            return Promise.resolve(callback({ data: [], error: null }));
          },
          configurable: true
        });
        return chainMock;
      })
    }
  };
});

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock the billing actions
vi.mock('@/app/actions/billing', () => ({
  createBillingRecord: vi.fn().mockResolvedValue('new-billing-id'),
  updateBillingRecord: vi.fn().mockResolvedValue({ success: true }),
  deleteBillingRecord: vi.fn().mockResolvedValue({ success: true })
}));

// Import the mocked modules to use in tests
import { supabase } from '@/utils/supabase/client';
import { createBillingRecord, updateBillingRecord, deleteBillingRecord } from '@/app/actions/billing';

describe('useBilling Hook', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBilling());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.records).toEqual([]);
    expect(result.current.selectedRecord).toBe(null);
    expect(result.current.filters).toEqual({});
    expect(result.current.stats).toBe(null);
  });

  it('should fetch billing records successfully', async () => {
    // Mock successful response from Supabase
    const mockRecords = [
      { 
        id: 'invoice-1', 
        patient_id: 'patient-1',
        patient: { id: 'patient-1', first_name: 'John', last_name: 'Doe' }
      }
    ];
    
    // Override the from implementation for this test
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        order: () => Promise.resolve({
          data: mockRecords,
          error: null
        })
      })
    }));
    
    const { result } = renderHook(() => useBilling());
    
    await act(async () => {
      await result.current.fetchBillingRecords();
    });
    
    expect(supabase.from).toHaveBeenCalledWith('billing');
    expect(result.current.records).toEqual(mockRecords);
  });

  it('should create a billing record successfully', async () => {
    // Mock form data
    const mockFormData: BillingFormData = {
      patient_id: 'patient-1',
      invoice_date: new Date('2023-05-01'),
      due_date: new Date('2023-06-01'),
      payment_method: 'credit_card',
      payment_status: 'pending',
      services: [{ name: 'Consultation', quantity: 1, price: 150 }],
      total_amount: 150,
      notes: 'Test invoice'
    };
    
    // Override the from implementation to track if fetchBillingRecords was called
    let fetchBillingRecordsCalled = false;
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        order: () => {
          fetchBillingRecordsCalled = true;
          return Promise.resolve({
            data: [],
            error: null
          });
        }
      })
    }));
    
    const { result } = renderHook(() => useBilling());
    
    let returnValue;
    await act(async () => {
      returnValue = await result.current.createBilling(mockFormData);
    });
    
    expect(createBillingRecord).toHaveBeenCalled();
    expect(fetchBillingRecordsCalled).toBe(true);
    expect(returnValue).toBe('new-billing-id');
  });

  it('should update a billing record successfully', async () => {
    // Mock form data
    const mockFormData: BillingFormData = {
      patient_id: 'patient-1',
      invoice_date: new Date('2023-05-01'),
      due_date: new Date('2023-06-01'),
      payment_method: 'credit_card',
      payment_status: 'paid',
      payment_date: new Date('2023-05-15'),
      services: [{ name: 'Consultation', quantity: 1, price: 150 }],
      total_amount: 150,
      notes: 'Updated invoice'
    };
    
    // Override the from implementation to track if fetchBillingRecords was called
    let fetchBillingRecordsCalled = false;
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        order: () => {
          fetchBillingRecordsCalled = true;
          return Promise.resolve({
            data: [],
            error: null
          });
        }
      })
    }));
    
    const { result } = renderHook(() => useBilling());
    
    let returnValue;
    await act(async () => {
      returnValue = await result.current.updateBilling('invoice-1', mockFormData);
    });
    
    expect(updateBillingRecord).toHaveBeenCalledWith('invoice-1', expect.any(Object));
    expect(fetchBillingRecordsCalled).toBe(true);
    expect(returnValue).toBe(true);
  });

  it('should delete a billing record successfully', async () => {
    // Override the from implementation to track if fetchBillingRecords was called
    let fetchBillingRecordsCalled = false;
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        order: () => {
          fetchBillingRecordsCalled = true;
          return Promise.resolve({
            data: [],
            error: null
          });
        }
      })
    }));
    
    const { result } = renderHook(() => useBilling());
    
    let returnValue;
    await act(async () => {
      returnValue = await result.current.deleteBilling('invoice-1');
    });
    
    expect(deleteBillingRecord).toHaveBeenCalledWith('invoice-1');
    expect(fetchBillingRecordsCalled).toBe(true);
    expect(returnValue).toBe(true);
  });

  it('should fetch billing stats successfully', async () => {
    // Mock successful response for billing stats
    const mockStats = {
      totalMonthlyRevenue: 1500,
      totalOutstanding: 500,
      recentTransactions: [{ id: 'invoice-1' }, { id: 'invoice-2' }]
    };
    
    // Override the from implementation for this test
    (supabase.from as any).mockImplementation(() => {
      return {
        select: () => ({
          gte: () => ({
            lte: () => Promise.resolve({
              data: [{ total_amount: 1500 }],
              error: null
            })
          }),
          in: () => Promise.resolve({
            data: [{ total_amount: 500 }],
            error: null
          }),
          order: () => ({
            limit: () => Promise.resolve({
              data: mockStats.recentTransactions,
              error: null
            })
          })
        })
      };
    });
    
    const { result } = renderHook(() => useBilling());
    
    // Mock window.Date to control date calculations
    const realDate = global.Date;
    const mockDate = new Date('2023-05-15');
    global.Date = class extends realDate {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as typeof global.Date;
    
    let returnValue;
    await act(async () => {
      returnValue = await result.current.fetchBillingStats();
    });
    
    // Restore the real Date
    global.Date = realDate;
    
    expect(result.current.stats).toEqual(mockStats);
    expect(returnValue).toEqual(mockStats);
  });

  it('should calculate total amount correctly', () => {
    const { result } = renderHook(() => useBilling());
    
    const services = [
      { name: 'Service 1', quantity: 2, price: 100 },
      { name: 'Service 2', quantity: 1, price: 150 }
    ];
    
    const total = result.current.calculateTotalAmount(services);
    expect(total).toBe(350); // (2 * 100) + (1 * 150)
  });

  it('should handle errors when fetching billing records', async () => {
    // Mock error response from Supabase
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        order: () => Promise.resolve({
          data: null,
          error: new Error('Database error')
        })
      })
    }));
    
    const { result } = renderHook(() => useBilling());
    
    // Spy on console.error to verify it's called
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await act(async () => {
      await result.current.fetchBillingRecords();
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(result.current.records).toEqual([]);
    
    // Restore console.error
    consoleSpy.mockRestore();
  });

  it('should apply filters when fetching billing records', async () => {
    // Create a mock implementation that can track filter calls
    const mockQueryBuilder = {
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((callback) => {
        return Promise.resolve(callback({ data: [], error: null }));
      })
    };
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => mockQueryBuilder
    }));
    
    const { result } = renderHook(() => useBilling());
    
    const filters: BillingFilter = {
      patientId: 'patient-1',
      paymentStatus: 'pending',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31')
    };
    
    await act(async () => {
      await result.current.fetchBillingRecords(filters);
    });
    
    expect(supabase.from).toHaveBeenCalledWith('billing');
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('patient_id', 'patient-1');
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('payment_status', 'pending');
    expect(mockQueryBuilder.gte).toHaveBeenCalled();
    expect(mockQueryBuilder.lte).toHaveBeenCalled();
    expect(result.current.filters).toEqual(filters);
  });
}); 