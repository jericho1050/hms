import { vi } from 'vitest';

// Mock the @supabase/ssr module
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn().mockImplementation(() => {
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
  })
}));

// This will effectively mock the Supabase client module itself
vi.mock('@/utils/supabase/client', () => {
  const mockSupabase = {
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
  
  return {
    createClient: vi.fn().mockReturnValue(mockSupabase),
    supabase: mockSupabase
  };
});