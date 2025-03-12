import { vi } from 'vitest'

// Mock Supabase client
export const mockSupabaseClient = {
  from: (table: string) => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => ({
      data: {
        id: 'test-id',
        first_name: 'Test',
        last_name: 'Patient',
        email: 'test.patient@example.com',
      },
      error: null,
    })),
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