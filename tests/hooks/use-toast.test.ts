import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast, toast, reducer } from '../../hooks/use-toast'
import type { State, Action, ToasterToast } from '@/types/toast'


describe('useToast', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.clearAllTimers()
    })

    it('should return the toast function and state', () => {
        const { result } = renderHook(() => useToast())
        
        expect(result.current.toasts).toEqual([])
        expect(typeof result.current.toast).toBe('function')
        expect(typeof result.current.dismiss).toBe('function')
    })

    it('should add a toast when toast() is called', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
            result.current.toast({ title: 'Test toast', description: 'Test description' })
        })
        
        expect(result.current.toasts.length).toBe(1)
        expect(result.current.toasts[0].title).toBe('Test toast')
        expect(result.current.toasts[0].description).toBe('Test description')
        expect(result.current.toasts[0].open).toBe(true)
    })

    it('should update a toast when update() is called', () => {
        const { result } = renderHook(() => useToast())
        
        let toastId: string
        
        act(() => {
            const response = result.current.toast({ title: 'Initial title' })
            toastId = response.id
        })
        
        act(() => {
            const toastToUpdate = result.current.toasts.find(t => t.id === toastId)
            if (toastToUpdate) {
                result.current.toast({ ...toastToUpdate, title: 'Updated title' })
            }
        })
        
        expect(result.current.toasts[0].title).toBe('Updated title')
    })

    it('should dismiss a toast when dismiss() is called', () => {
        const { result } = renderHook(() => useToast())
        
        let toastId: string
        
        act(() => {
            const response = result.current.toast({ title: 'Test toast' })
            toastId = response.id
        })
        
        act(() => {
            result.current.dismiss(toastId)
        })
        
        expect(result.current.toasts[0].open).toBe(false)
    })

    it('should limit the number of toasts to TOAST_LIMIT', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
            result.current.toast({ title: 'Toast 1' })
            result.current.toast({ title: 'Toast 2' })
        })
        
        // Since TOAST_LIMIT is 1, only the most recent toast should be present
        expect(result.current.toasts.length).toBe(1)
        expect(result.current.toasts[0].title).toBe('Toast 2')
    })
})

describe('reducer', () => {
    it('should handle ADD_TOAST action', () => {
        const initialState: State = { toasts: [] }
        const toast: ToasterToast = { id: '1', title: 'Test', open: true, onOpenChange: () => {} }
        const action: Action = { type: 'ADD_TOAST', toast }
        
        const newState = reducer(initialState, action)
        
        expect(newState.toasts.length).toBe(1)
        expect(newState.toasts[0]).toEqual(toast)
    })
    
    it('should handle UPDATE_TOAST action', () => {
        const initialState: State = { 
            toasts: [{ id: '1', title: 'Original', open: true, onOpenChange: () => {} }] 
        }
        const updatedToast: ToasterToast = { id: '1', title: 'Updated', open: true, onOpenChange: () => {} }
        const action: Action = { type: 'UPDATE_TOAST', toast: updatedToast }
        
        const newState = reducer(initialState, action)
        
        expect(newState.toasts[0].title).toBe('Updated')
    })
    
    it('should handle REMOVE_TOAST action', () => {
        const initialState: State = { 
            toasts: [{ id: '1', title: 'Toast', open: true, onOpenChange: () => {} }] 
        }
        const action: Action = { type: 'REMOVE_TOAST', toastId: '1' }
        
        const newState = reducer(initialState, action)
        
        expect(newState.toasts.length).toBe(0)
    })
})