import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFormField } from '../../hooks/use-form-field';
import { FormFieldContext, FormItemContext } from '@/contexts/form-context';
import { useFormContext } from 'react-hook-form';
import React from 'react';

// Mock the react-hook-form's useFormContext
vi.mock('react-hook-form', () => ({
    useFormContext: vi.fn()
}));

// Create proper wrapper with context providers
const createWrapper = (fieldContext: any, itemContext: any) => {
    return ({ children }: { children: React.ReactNode }) => (
        <FormFieldContext.Provider value={fieldContext}>
            <FormItemContext.Provider value={itemContext}>
                {children}
            </FormItemContext.Provider>
        </FormFieldContext.Provider>
    );
};

describe('useFormField', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should throw an error if FormFieldContext is not provided', () => {
        // Mock returns null for field context
        vi.mocked(useFormContext).mockReturnValue({
            getFieldState: vi.fn(),
            formState: {}
        } as any);

        expect(() => {
            renderHook(() => useFormField(), {
                wrapper: createWrapper(null, { id: 'testId' })
            });
        }).toThrow('useFormField should be used within <FormField>');
    });

    it('should return the correct values when contexts are provided', () => {
        const mockFieldState = {
            isDirty: false,
            isTouched: false,
            invalid: false,
        };
        
        vi.mocked(useFormContext).mockReturnValue({
            getFieldState: vi.fn().mockReturnValue(mockFieldState),
            formState: {}
        } as any);

        const { result } = renderHook(() => useFormField(), {
            wrapper: createWrapper({ name: 'testField' }, { id: 'testId' })
        });
        
        expect(result.current).toEqual({
            id: 'testId',
            name: 'testField',
            formItemId: 'testId-form-item',
            formDescriptionId: 'testId-form-item-description',
            formMessageId: 'testId-form-item-message',
            ...mockFieldState,
        });
    });

    it('should include field state from getFieldState', () => {
        const mockFieldState = {
            isDirty: true,
            isTouched: true,
            invalid: true,
            error: { type: 'required', message: 'This field is required' },
        };
        
        vi.mocked(useFormContext).mockReturnValue({
            getFieldState: vi.fn().mockReturnValue(mockFieldState),
            formState: {}
        } as any);
        
        const { result } = renderHook(() => useFormField(), {
            wrapper: createWrapper({ name: 'testField' }, { id: 'testId' })
        });
        
        expect(result.current).toMatchObject(mockFieldState);
    });

    it('should call getFieldState with the correct parameters', () => {
        const mockGetFieldState = vi.fn().mockReturnValue({});
        const mockFormState = { isDirty: true };
        
        vi.mocked(useFormContext).mockReturnValue({
            getFieldState: mockGetFieldState,
            formState: mockFormState
        } as any);
        
        renderHook(() => useFormField(), {
            wrapper: createWrapper({ name: 'testField' }, { id: 'testId' })
        });
        
        expect(mockGetFieldState).toHaveBeenCalledWith('testField', mockFormState);
    });
});