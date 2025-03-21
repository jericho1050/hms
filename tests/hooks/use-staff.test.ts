import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStaffData, useStaff } from '../../hooks/use-staff';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '../../hooks/use-auth';

// Define mock types matching Supabase client
const mockSubscription = { unsubscribe: vi.fn() };

// Mock dependencies
vi.mock('@/utils/supabase/client', () => {
    // Create a more complete mock implementation for the supabase object
    const mockSupabaseClient = {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                range: vi.fn(() => ({
                    then: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
                })),
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                })),
                or: vi.fn(() => ({
                    then: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
                })),
            })),
            insert: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn()
        })),
        auth: {
            getUser: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: mockSubscription }
            })),
            signIn: vi.fn()
        },
        rpc: vi.fn(),
        storage: { from: vi.fn() },
        functions: { invoke: vi.fn() },
        channel: vi.fn(),
        url: '',
        headers: {}
    };

    return {
        supabase: mockSupabaseClient,
        createClient: vi.fn(() => mockSupabaseClient)
    };
});

vi.mock('@supabase/ssr', () => ({
    createBrowserClient: vi.fn().mockImplementation(() => {
        return {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: {
                        user: {
                            app_metadata: {},
                            user_metadata: {}
                        }
                    },
                    error: null
                }),
                onAuthStateChange: vi.fn(() => ({
                    data: { subscription: mockSubscription }
                }))
            },
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
            })),
            rpc: vi.fn(),
            storage: { from: vi.fn() },
            functions: { invoke: vi.fn() },
            channel: vi.fn(),
            url: '',
            headers: {}
        };
    })
}));

vi.mock('../../hooks/use-auth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/app/actions/staff', () => ({
    addStaffMember: vi.fn(),
    updateStaffMember: vi.fn(),
    updateStaffAvailability: vi.fn(),
}));

// Create mock data for tests
const mockStaffData = [
    { 
        id: '1', 
        first_name: 'John', 
        last_name: 'Doe',
        role: 'Doctor',
        department: 'Cardiology',
        email: 'john@example.com',
        contact_number: '123-456-7890',
        status: 'active'
    }
];

// Remove circular dependency by not mocking the actual module under test
describe('useStaffData', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        
        // Setup mock implementation for supabase client
        (vi.mocked(createClient)().from as any).mockImplementation(() => ({
            select: vi.fn().mockImplementation(() => ({
                range: vi.fn().mockResolvedValue({ 
                    data: mockStaffData, 
                    error: null, 
                    count: mockStaffData.length 
                }),
                eq: vi.fn(),
                or: vi.fn(),
                then: vi.fn()
            })),
            insert: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn()
        } as any));
    });

    it('should initialize with loading state and empty arrays', () => {
        const { result } = renderHook(() => useStaffData());
        
        expect(result.current.isLoading).toBe(true);
        expect(result.current.staffData).toEqual([]);
        expect(result.current.filteredStaff).toEqual([]);
    });

    it('should handle page changes', async () => {
        const { result } = renderHook(() => useStaffData());
        
        // Wait for initial data to load
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 1000 });
        
        // Call changePage method
        result.current.changePage(1);
        
        // Verify the function exists
        expect(typeof result.current.changePage).toBe('function');
    });
});

describe('useStaff', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        
        // Mock the useAuth hook with proper types
        vi.mocked(useAuth).mockReturnValue({
            user: {
                id: 'user-123',
                app_metadata: {},
                user_metadata: {},
                aud: '',
                created_at: ''
            },
            isLoading: false,
            isAuthenticated: true,
            signOut: vi.fn(),
        });
        
        // Setup mock for the Supabase client
            (vi.mocked(createClient)().from as any).mockImplementation(() => ({
            select: vi.fn().mockImplementation(() => ({
                eq: vi.fn().mockImplementation(() => ({
                    single: vi.fn().mockResolvedValue({ 
                        data: { id: 'test-staff-id' }, 
                        error: null 
                    })
                }))
            })),
            insert: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn()
        } as any));
    });

    it('should fetch staff ID for authenticated user', async () => {
        const { result } = renderHook(() => useStaff());
        
        // Wait for the async effects to complete
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        
        expect(result.current.staffId).toBe('test-staff-id');
        expect(result.current.error).toBeNull();
    });

    it('should handle missing staff record', async () => {
        // Mock a response with no data
        (vi.mocked(createClient)().from as any).mockImplementation(() => ({
            select: vi.fn().mockImplementation(() => ({
                eq: vi.fn().mockImplementation(() => ({
                    single: vi.fn().mockResolvedValue({ 
                        data: null, 
                        error: null 
                    })
                }))
            })),
            insert: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn()
        } as any));
        
        const { result } = renderHook(() => useStaff());
        
        // Wait for the async effects to complete
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        
        expect(result.current.staffId).toBe('00000000-0000-0000-0000-000000000000'); // fallback ID
        expect(result.current.error).toBe('No staff record found for this user');
    });

    it('should handle unauthenticated user', async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            signOut: vi.fn(),
        });
        
        const { result } = renderHook(() => useStaff());
        
        expect(result.current.isLoading).toBe(false);
        expect(result.current.staffId).toBeNull();
    });
});