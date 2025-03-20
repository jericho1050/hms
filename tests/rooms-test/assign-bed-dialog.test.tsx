import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssignBedDialog } from '../../components/rooms/assign-bed-dialog'
import '../mocks/select-mock';

// Mock the supabase client
vi.mock('@/utils/supabase/client', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                limit: vi.fn(() => ({
                    or: vi.fn().mockReturnThis(),
                    data: [
                        { id: '1', first_name: 'John', last_name: 'Doe' },
                        { id: '2', first_name: 'Jane', last_name: 'Smith' }
                    ],
                    error: null
                }))
            }))
        }))
    }
}))

// Mock date-fns to avoid time-based test failures
vi.mock('date-fns', async () => {
    const actual = await vi.importActual('date-fns')
    return {
        ...actual,
        format: vi.fn().mockImplementation(() => '2023-01-01T00:00:00')
    }
})

// Mock the Select component
vi.mock('@/components/ui/select', () => {
    return {
        Select: ({ children, onValueChange }: { children: React.ReactNode, onValueChange?: (value: string) => void }) => (
            <div data-testid="select-root" onClick={() => onValueChange && onValueChange('1')}>
                {children}
            </div>
        ),
        SelectTrigger: ({ children, id }: { children: React.ReactNode, id?: string }) => (
            <button data-testid="select-trigger" id={id} role="combobox">
                {children}
            </button>
        ),
        SelectValue: ({ placeholder }: { placeholder?: string }) => (
            <span data-testid="select-value">{placeholder}</span>
        ),
        SelectContent: ({ children, className }: { children: React.ReactNode, className?: string }) => (
            <div data-testid="select-content" className={className}>
                {children}
            </div>
        ),
        SelectItem: ({ children, value, disabled }: { children: React.ReactNode, value: string, disabled?: boolean }) => (
            <div
                data-testid={`select-item-${value}`}
                data-value={value}
                role="option"
            >
                {children}
            </div>
        ),
    }
})

describe('AssignBedDialog', () => {
    const mockRoom = {
        id: 'room-1',
        name: 'General Ward',
        roomNumber: '101',
        floor: '1',
        type: 'Ward',
        departmentId: 'dept-1',
        wing: 'East',
        status: 'available' as const,
        facilities: ['Oxygen', 'Monitoring'],
        beds: [
            { id: 'room-1-bed-1', name: 'Bed 1', status: 'available', type: 'Standard', patientId: null },
            { id: 'room-1-bed-2', name: 'Bed 2', status: 'available', type: 'Standard', patientId: null }
        ]
    }

    const mockProps = {
        roomId: 'room-1',
        bedId: 'room-1-bed-1',
        room: mockRoom,
        onClose: vi.fn(),
        onAssign: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the dialog with correct room and bed information', () => {
        render(<AssignBedDialog {...mockProps} />)
        
        expect(screen.getByText('Assign Patient to Bed')).toBeInTheDocument()
        expect(screen.getByText('General Ward - Room 101, Bed 1')).toBeInTheDocument()
    })

    it('loads patients on initial render', async () => {
        render(<AssignBedDialog {...mockProps} />)
        
        await waitFor(() => {
            expect(screen.getByText('Showing 2 patients')).toBeInTheDocument()
        })
    })

    it('allows patient selection', async () => {
        const user = userEvent.setup()
        render(<AssignBedDialog {...mockProps} />)
        
        // Wait for patients to load
        await waitFor(() => {
            expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument()
        })
        
        // Click the select to trigger onValueChange in our mock
        await user.click(screen.getByTestId('select-root'))
        
        // The assign button should be enabled
        await waitFor(() => {
            expect(screen.getByText('Assign Patient')).not.toBeDisabled()
        })
    })
    it('allows searching for patients', async () => {
        const user = userEvent.setup()
        render(<AssignBedDialog {...mockProps} />)
        
        const searchInput = screen.getByPlaceholderText('Search by name...')
        await user.type(searchInput, 'John')
        
        // The search should trigger after debounce
        await waitFor(() => {
            expect(searchInput).toHaveValue('John')
        })
    })

    it('allows selecting admission date', async () => {
        const user = userEvent.setup()
        render(<AssignBedDialog {...mockProps} />)
        
        // Click on the admission date button
        await user.click(screen.getAllByText(/select date/i)[0] || screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/))
        
        // Calendar should be displayed, select a date
        const dateCell = screen.getAllByRole('gridcell')[15] // Just picking a cell
        await user.click(dateCell)
    })

    it('allows toggling emergency status', async () => {
        const user = userEvent.setup()
        render(<AssignBedDialog {...mockProps} />)
        
        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)
        
        expect(checkbox).toBeChecked()
    })

    it('calls onAssign with correct data when form is submitted', async () => {
        const user = userEvent.setup()
        render(<AssignBedDialog {...mockProps} />)
        
        // Wait for patients to load
        await waitFor(() => {
            expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument()
        })
        
        // Select a patient by clicking on the Select component to trigger its onValueChange
        await user.click(screen.getByTestId('select-root'))
                
        // Submit the form
        await user.click(screen.getByText('Assign Patient'))
        
        expect(mockProps.onAssign).toHaveBeenCalledWith(
            '1', // patientId
            'John Doe', // patientName - this was missing in the original test
            '2023-01-01T00:00:00', // admissionDate (mocked)
            undefined, // expectedDischargeDate
            false // isEmergency
        )
    })

    it('disables assign button when no patient is selected', () => {
        render(<AssignBedDialog {...mockProps} />)
        
        expect(screen.getByText('Assign Patient')).toBeDisabled()
    })

    it('closes dialog when cancel is clicked', async () => {
        const user = userEvent.setup()
        render(<AssignBedDialog {...mockProps} />)
        
        await user.click(screen.getByText('Cancel'))
        
        expect(mockProps.onClose).toHaveBeenCalled()
    })
})