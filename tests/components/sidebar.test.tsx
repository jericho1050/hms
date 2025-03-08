
if (typeof window !== "undefined" && !window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })),
    });
  }

import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import * as React from 'react'
import { useSidebar, SidebarProvider } from '../../components/ui/sidebar'
import { SidebarContext } from '@/contexts/sidebar-context'

describe('useSidebar', () => {
    it('should throw an error when used outside of SidebarProvider', () => {
        // Suppress the error console to avoid cluttering test output
        const consoleSpy = vi.spyOn(console, 'error')
        consoleSpy.mockImplementation(() => {})

        // Expect the hook to throw when rendered without a provider
        expect(() => {
            renderHook(() => useSidebar())
        }).toThrow('useSidebar must be used within a SidebarProvider.')

        consoleSpy.mockRestore()
    })

    it('should return the sidebar context when used within a SidebarProvider', () => {
        // Render the hook within a SidebarProvider
        const { result } = renderHook(() => useSidebar(), {
            wrapper: ({ children }) => <SidebarProvider>{children}</SidebarProvider>
        })

        // Verify all expected properties are present in the returned context
        expect(result.current).toHaveProperty('state')
        expect(result.current).toHaveProperty('open')
        expect(result.current).toHaveProperty('setOpen')
        expect(result.current).toHaveProperty('isMobile')
        expect(result.current).toHaveProperty('openMobile')
        expect(result.current).toHaveProperty('setOpenMobile')
        expect(result.current).toHaveProperty('toggleSidebar')
    })

    it('should use provided open state when controlled externally', () => {
        const onOpenChange = vi.fn()
        
        const { result } = renderHook(() => useSidebar(), {
            wrapper: ({ children }) => (
                <SidebarProvider open={true} onOpenChange={onOpenChange}>
                    {children}
                </SidebarProvider>
            )
        })

        expect(result.current.open).toBe(true)
    })
})