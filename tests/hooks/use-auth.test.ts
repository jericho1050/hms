import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react'; // Changed from react-hooks
import { useAuth } from '@/hooks/use-auth';

vi.mock('@/utils/supabase/client', () => ({
    createClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn()
      }
    }))
}));

// Import the mocked module
import { createClient } from '../../utils/supabase/client';

describe('useAuth', () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSupabase = {
        auth: {
            getUser: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn()
        }
    };
    const mockUnsubscribe = vi.fn();

    beforeEach(() => {
        // Reset all mocks
        vi.resetAllMocks();
        
        // Setup default mock implementations
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
        mockSupabase.auth.onAuthStateChange.mockImplementation(() => {
            return {
                data: { subscription: { unsubscribe: mockUnsubscribe } }
            };
        });
        
        // Set up the mock return value for createClient
        (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with loading state and no user', async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
        
        const { result } = renderHook(() => useAuth());
        
        expect(result.current.isLoading).toBe(true);
        expect(result.current.user).toBe(null);
        expect(result.current.isAuthenticated).toBe(false);
        
        // Wait for the state to update
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        
        expect(result.current.user).toBe(null);
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set user when authenticated', async () => {
        const { result } = renderHook(() => useAuth());
        
        // Wait for the state to update
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
        expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);
    });

    it('should update user when auth state changes', async () => {
        const { result } = renderHook(() => useAuth());
        
        // Wait for the state to update
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        
        // Extract the callback that was passed to onAuthStateChange
        const callback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0];
        
        // Simulate auth state change
        act(() => {
            callback('SIGNED_IN', { user: { ...mockUser, email: 'updated@example.com' } });
        });
        
        expect(result.current.user).toEqual({ ...mockUser, email: 'updated@example.com' });
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('should sign out correctly', async () => {
        const { result } = renderHook(() => useAuth());
        
        // Wait for the state to update
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        
        await act(async () => {
            await result.current.signOut();
        });
        
        expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
        expect(result.current.user).toBe(null);
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should unsubscribe from auth changes on unmount', async () => {
        const { result, unmount } = renderHook(() => useAuth());
        
        // Wait for the state to update
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        
        unmount();
        
        expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
});