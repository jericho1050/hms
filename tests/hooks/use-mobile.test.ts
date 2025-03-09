import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react' // Updated import
import { useIsMobile } from '../../hooks/use-mobile'

describe('useIsMobile', () => {
    let originalInnerWidth: number
    let mockMatchMedia: any
    let listeners: any[] = []

    beforeEach(() => {
        originalInnerWidth = window.innerWidth
        listeners = []
        
        mockMatchMedia = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            addEventListener: (event: string, listener: () => void) => {
                listeners.push(listener)
            },
            removeEventListener: vi.fn()
        }))
        
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: mockMatchMedia,
        })
    })

    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: originalInnerWidth,
        })
        vi.restoreAllMocks()
    })

    it('should return true when window width is below mobile breakpoint', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 767,
        })
        
        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(true)
    })

    it('should return false when window width is at mobile breakpoint', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 768,
        })
        
        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(false)
    })

    it('should return false when window width is above mobile breakpoint', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 1024,
        })
        
        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(false)
    })

    it('should update when window size changes', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 1024,
        })
        
        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(false)
        
        // Simulate resize event
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 767,
        })
        
        // Trigger the event listener callback using act
        act(() => {
            // Call all listeners that were registered
            listeners.forEach(listener => listener())
        })
        
        expect(result.current).toBe(true)
    })
})