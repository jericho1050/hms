import { vi } from 'vitest'

// Mock Supabase client
export const mockSupabaseClient = {
  from: () => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    // Make sure `delete()` returns an object whose `eq(...)` method 
    // finally returns { data: null, error: null }
    delete: vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockImplementation(() => ({
        data: null,
        error: null,     // so deleteError === null
      })),
    })),

    // For selecting data after a delete, 
    // eq(...) can still return a `single()` chain that has { data, error }
    eq: vi.fn().mockImplementation(() => ({
      data: null,
      error: null,
      single: vi.fn().mockReturnValue({
        data: {
          id: 'test-id',
          first_name: 'Test',
          last_name: 'Patient',
          email: 'test.patient@example.com',
        },
        error: null,
      }),
    })),

    single: vi.fn().mockReturnValue({
      data: {
        id: 'test-id',
        first_name: 'Test',
        last_name: 'Patient',
        email: 'test.patient@example.com',
      },
      error: null,
    }),
  }),
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock modules
vi.mock('@/utils/supabase/client', () => ({
  supabase: mockSupabaseClient,
}))