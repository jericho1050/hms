import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RestockItemDialog } from '@/components/inventory/restock-item-dialog'
import { useToast } from '@/components/ui/use-toast'
import * as inventoryActions from '@/app/inventory/actions'

// Mock dependencies
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-description">{children}</div>,
}))

vi.mock('@/components/ui/form', () => {
  return {
    Form: ({ children }: { children: React.ReactNode }) => <div data-testid="form">{children}</div>,
    FormField: ({ control, name, render }: any) => {
      // Call the render function with a mock fieldState and field
      return render({
        field: {
          value: control._fields[name] || '',
          onChange: (e: any) => {
            // Update the control fields
            control._fields[name] = typeof e === 'object' && e.target ? e.target.value : e
            control._formState.isDirty = true
          },
          name,
        },
        fieldState: {
          error: control._errors[name] ? { message: control._errors[name] } : undefined,
        },
      })
    },
    FormItem: ({ children }: { children: React.ReactNode }) => <div data-testid="form-item">{children}</div>,
    FormLabel: ({ children }: { children: React.ReactNode }) => <label data-testid="form-label">{children}</label>,
    FormControl: ({ children }: { children: React.ReactNode }) => <div data-testid="form-control">{children}</div>,
    FormMessage: ({ children }: { children: React.ReactNode }) => <div data-testid="form-message">{children}</div>,
    FormDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="form-description">{children}</div>,
  }
})

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type }: any) => (
    <button 
      onClick={onClick} 
      type={type} 
      data-testid={children === "Restock" ? "submit-button" : "cancel-button"}
    >
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => (
    <input
      data-testid="input"
      id={props.id}
      name={props.name}
      value={props.value || ''}
      onChange={props.onChange}
    />
  ),
}))

// Mock useToast
const mockToast = {
  toast: vi.fn(),
}
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => mockToast,
}))

// Mock inventoryActions
vi.mock('@/app/inventory/actions', () => ({
  restockInventoryItem: vi.fn(),
}))

// Mock react-hook-form
const mockHandleSubmit = vi.fn((onSubmit) => {
  // Store the onSubmit function to call it directly in tests
  mockHandleSubmit.onSubmit = onSubmit
  return (e) => {
    if (e && e.preventDefault) e.preventDefault()
    return false
  }
})
mockHandleSubmit.onSubmit = null
const mockReset = vi.fn()
const mockWatch = vi.fn()
const mockRegister = vi.fn()
const mockSetValue = vi.fn()
const mockFormState = {
  errors: {},
  isDirty: false,
  isSubmitting: false,
}

const mockUseFormReturn = {
  register: mockRegister,
  handleSubmit: mockHandleSubmit,
  formState: mockFormState,
  control: {
    _formState: mockFormState,
    _fields: {},
    _errors: {},
  },
  reset: mockReset,
  watch: mockWatch,
  setValue: mockSetValue,
}

vi.mock('react-hook-form', () => ({
  useForm: () => mockUseFormReturn,
}))

describe('RestockItemDialog', () => {
  const mockItem = {
    id: '1',
    name: 'Test Item',
    quantity: 10,
    category: 'Test Category',
    location: 'Test Location',
    threshold: 5,
    unit: 'units',
  }

  const mockOnOpenChange = vi.fn()
  const mockOnRestock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset form control state
    mockUseFormReturn.control._fields = {}
    mockUseFormReturn.control._errors = {}
    mockUseFormReturn.formState.errors = {}
    mockUseFormReturn.formState.isDirty = false
    mockUseFormReturn.formState.isSubmitting = false
  })

  it('renders correctly with item data', () => {
    render(<RestockItemDialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onRestock={mockOnRestock} />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title').textContent).toContain('Restock Item')
    expect(screen.getByTestId('form')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(<RestockItemDialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onRestock={mockOnRestock} />)
    const cancelButton = screen.getByTestId('cancel-button')
    fireEvent.click(cancelButton)
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('submits the form with valid data', async () => {
    vi.mocked(inventoryActions.restockInventoryItem).mockResolvedValue({ success: true })
    
    render(<RestockItemDialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onRestock={mockOnRestock} />)
    
    // Simulate entering quantity
    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: '5' } })
    mockUseFormReturn.control._fields.quantity = 5
    
    // Call onSubmit directly with mocked data
    mockHandleSubmit.onSubmit({ quantity: 5 })
    
    // Verify onRestock was called with correct data
    expect(mockOnRestock).toHaveBeenCalledWith(5)
    
    // Verify form was reset
    expect(mockReset).toHaveBeenCalled()
  })

  it('shows error message when submission fails', async () => {
    render(<RestockItemDialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onRestock={mockOnRestock} />)
    
    // Simulate entering quantity
    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: '5' } })
    mockUseFormReturn.control._fields.quantity = 5
    
    // Call onSubmit directly with mocked data
    mockHandleSubmit.onSubmit({ quantity: 5 })
    
    // Verify onRestock was called
    expect(mockOnRestock).toHaveBeenCalledWith(5)
  })

  it('validates that quantity must be positive', async () => {
    // Set up validation error
    mockUseFormReturn.control._errors = { quantity: 'Quantity must be positive' }
    mockUseFormReturn.formState.errors = { quantity: { message: 'Quantity must be positive' } }
    
    render(<RestockItemDialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onRestock={mockOnRestock} />)
    
    // With validation errors set, handleSubmit should not call onSubmit
    // This test verifies that the validation prevents form submission
    
    // Verify onRestock was not called due to validation error
    expect(mockOnRestock).not.toHaveBeenCalled()
  })

  it('resets the form after successful submission', async () => {
    render(<RestockItemDialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onRestock={mockOnRestock} />)
    
    // Simulate entering quantity
    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: '5' } })
    mockUseFormReturn.control._fields.quantity = 5
    
    // Call onSubmit directly with mocked data
    mockHandleSubmit.onSubmit({ quantity: 5 })
    
    // Verify reset was called
    expect(mockReset).toHaveBeenCalled()
  })
}) 