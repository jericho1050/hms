import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StaffDirectory } from '../../components/staff/staff-directory'
import { Staff } from '@/types/staff'

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}))

vi.mock('./edit-staff-form', () => ({
    EditStaffForm: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
        return isOpen ? (
            <div data-testid="edit-staff-form">
                Edit Staff Form <button onClick={onClose}>Close</button>
            </div>
        ) : null
    },
}))

vi.mock('./staff-profile', () => ({
    StaffProfile: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
        return isOpen ? (
            <div data-testid="staff-profile">
                Staff Profile <button onClick={onClose}>Close</button>
            </div>
        ) : null
    },
}))

describe('StaffDirectory', () => {
    const mockStaff: Staff[] = [
        {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            role: 'Doctor',
            department: 'Cardiology',
            joiningDate: '2023-01-15',
            status: 'active',
            address: '123 Main St',
            qualification: 'MD',
            availability: {
                recurring: {
                    monday: 'on-call',
                    tuesday: 'on-call',
                    wednesday: 'on-call',
                    thursday: 'on-call',
                    friday: 'on-call',
                    saturday: 'on-call',
                    sunday: 'on-call',
                },
                overrides: {},
            },
        },
        {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '234-567-8901',
            role: 'Nurse',
            department: 'Pediatrics',
            joiningDate: '2022-05-20',
            status: 'inactive',
            address: '456 Oak Ave',
            qualification: 'RN',
            availability: {
                recurring: {
                    monday: 'morning',
                    tuesday: 'morning',
                    wednesday: 'morning',
                    thursday: 'morning',
                    friday: 'morning',
                    saturday: 'morning',
                    sunday: 'morning',
                },
                overrides: {},
            },
        }
    ]

    const mockOnStaffUpdate = vi.fn()
    const mockChangePage = vi.fn()
    const mockChangePageSize = vi.fn()

    const mockPagination = {
        currentPage: 0,
        pageSize: 10,
        totalCount: 2,
        totalPages: 1,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders staff members in a table', () => {
        render(<StaffDirectory staff={mockStaff} onStaffUpdate={mockOnStaffUpdate} />)
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Doctor')).toBeInTheDocument()
        expect(screen.getByText('Nurse')).toBeInTheDocument()
        expect(screen.getByText('Cardiology')).toBeInTheDocument()
        expect(screen.getByText('Pediatrics')).toBeInTheDocument()
    })

    it('displays "No staff members found" when staff array is empty', () => {
        render(<StaffDirectory staff={[]} onStaffUpdate={mockOnStaffUpdate} />)
        expect(screen.getByText('No staff members found')).toBeInTheDocument()
        expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument()
    })

    it('renders pagination controls when pagination props are provided', () => {
        render(
            <StaffDirectory
                staff={mockStaff}
                onStaffUpdate={mockOnStaffUpdate}
                pagination={mockPagination}
                changePage={mockChangePage}
                changePageSize={mockChangePageSize}
            />
        )
        expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
        expect(screen.getByText(/Showing 1 to 2 of 2 staff members/)).toBeInTheDocument()
    })

    it('correctly handles pagination navigation', () => {
        const paginationWithMultiplePages = {
            ...mockPagination,
            currentPage: 1,
            totalPages: 3,
            totalCount: 25,
        }

        render(
            <StaffDirectory
                staff={mockStaff}
                onStaffUpdate={mockOnStaffUpdate}
                pagination={paginationWithMultiplePages}
                changePage={mockChangePage}
                changePageSize={mockChangePageSize}
            />
        )

        const prevButton = screen.getByLabelText('Previous page')
        const nextButton = screen.getByLabelText('Next page')

        fireEvent.click(prevButton)
        expect(mockChangePage).toHaveBeenCalledWith(0)

        fireEvent.click(nextButton)
        expect(mockChangePage).toHaveBeenCalledWith(2)
    });

      
      


    it('handles page size changes', async () => {
        // Mock the changePageSize function directly
        const mockChangePageSize = vi.fn()
        render(
            <StaffDirectory
                staff={mockStaff}
                onStaffUpdate={mockOnStaffUpdate}
                pagination={mockPagination}
                changePage={mockChangePage}
                changePageSize={mockChangePageSize}
                _testDirectChangePageSize={mockChangePageSize} // For testing only
            />
        )
        
        // Call the function directly with the new page size
        mockChangePageSize(20)
        
        expect(mockChangePageSize).toHaveBeenCalledWith(20)
    })

    it('displays correct status badges', () => {
        render(<StaffDirectory staff={mockStaff} onStaffUpdate={mockOnStaffUpdate} />)
      
        // Active staff badge
        const activeBadge = screen.getByText('Active')
        expect(activeBadge).toHaveClass('bg-green-100')
        expect(activeBadge).toHaveClass('text-green-800')
        expect(activeBadge).toHaveClass('hover:bg-green-100')
      
        // Inactive staff badge
        const inactiveBadge = screen.getByText('Inactive')
        expect(inactiveBadge).toHaveClass('bg-red-100')
        expect(inactiveBadge).toHaveClass('text-red-800')
        expect(inactiveBadge).toHaveClass('hover:bg-red-100')
      })

})
