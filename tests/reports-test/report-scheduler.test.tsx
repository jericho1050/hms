import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReportScheduler } from '../../components/reports/report-scheduler'
import * as useToastModule from '@/hooks/use-toast'

// Mock the useToast hook with all required properties
vi.mock('@/hooks/use-toast', () => ({
    useToast: vi.fn().mockReturnValue({
        toast: vi.fn().mockReturnValue({
            id: 'mock-toast-id',
            dismiss: vi.fn(),
            update: vi.fn(),
        }),
        dismiss: vi.fn(),
        toasts: [],
    }),
}))

// Mock fetch API
global.fetch = vi.fn()

// Default props for testing
const defaultProps = {
    onClose: vi.fn(),
    dateRange: { from: new Date('2023-01-01'), to: new Date('2023-01-31') },
    departmentFilter: 'cardiology',
    reportTypeFilter: 'clinical',
    activeTab: 'financial'
}

describe('ReportScheduler', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the component correctly', () => {
        render(<ReportScheduler {...defaultProps} />)
        
        // Check dialog title and description
        expect(screen.getByText('Schedule Regular Report')).toBeInTheDocument()
        expect(screen.getByText('Set up automated report generation and delivery on a regular schedule')).toBeInTheDocument()
        
        // Check beta notification
        expect(screen.getByText('Beta Feature')).toBeInTheDocument()
        
        // Check form fields - using alternative selectors instead of getByLabelText
        expect(screen.getByText('Report Name')).toBeInTheDocument()
        expect(screen.getByText('Report Type')).toBeInTheDocument()
        expect(screen.getByText('Frequency')).toBeInTheDocument()
        expect(screen.getByText('Email Recipients')).toBeInTheDocument()
        
        // Check buttons
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Schedule Report' })).toBeInTheDocument()
    })

    it('sets default form values correctly based on props', () => {
        render(<ReportScheduler {...defaultProps} />)
        
        // Find input by value instead of label/role
        const reportNameInput = screen.getByDisplayValue('Financial Report - Cardiology') as HTMLInputElement
        expect(reportNameInput.value).toBe('Financial Report - Cardiology')
    })

    it('validates form fields when submitting', async () => {
        const user = userEvent.setup()
        render(<ReportScheduler {...defaultProps} />)
        
        // Clear the report name input by finding it with getByDisplayValue
        const reportNameInput = screen.getByDisplayValue('Financial Report - Cardiology')
        await user.clear(reportNameInput)
        
        // Submit the form
        await user.click(screen.getByRole('button', { name: 'Schedule Report' }))
        
        // Check validation errors
        await waitFor(() => {
            expect(screen.getByText('Report name must be at least 2 characters')).toBeInTheDocument()
        })
    })

    it('submits the form successfully', async () => {
        const user = userEvent.setup()
        const mockToast = vi.fn()
        vi.mocked(useToastModule.useToast).mockReturnValue({
            toast: mockToast,
            dismiss: vi.fn(),
            toasts: []
        })
        
        // Mock successful fetch response
        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValueOnce({ id: '123' })
        } as unknown as Response)
        
        render(<ReportScheduler {...defaultProps} />)
        
        // Find the email input - look for any textbox that isn't the report name input
        const inputs = screen.getAllByRole('textbox')
        const emailInput = inputs.find(input => 
            (input as HTMLInputElement).value !== 'Financial Report - Cardiology'
        )
        expect(emailInput).toBeTruthy()
        await user.type(emailInput!, 'test@example.com')
        
        // Submit the form
        await user.click(screen.getByRole('button', { name: 'Schedule Report' }))
        
        // Wait for submission to complete
        await waitFor(() => {
            // Verify toast was shown
            expect(mockToast).toHaveBeenCalledWith({
                title: "Report Scheduled",
                description: expect.stringContaining("financial"),
            })
            
            // Verify onClose was called
            expect(defaultProps.onClose).toHaveBeenCalled()
        })
    })

    it('handles form submission errors', async () => {
        const user = userEvent.setup()
        const mockToast = vi.fn()
        vi.mocked(useToastModule.useToast).mockReturnValue({
            toast: mockToast,
            dismiss: vi.fn(),
            toasts: []
        })
        
        // Mock failed fetch response
        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: false,
            json: vi.fn().mockResolvedValueOnce({ error: 'API error' })
        } as unknown as Response)
        
        render(<ReportScheduler {...defaultProps} />)
        
        // Find the email input as we did in the previous test
        const inputs = screen.getAllByRole('textbox')
        const emailInput = inputs.find(input => 
            (input as HTMLInputElement).value !== 'Financial Report - Cardiology'
        )
        expect(emailInput).toBeTruthy()
        await user.type(emailInput!, 'test@example.com')
        
        // Submit the form
        await user.click(screen.getByRole('button', { name: 'Schedule Report' }))
        
        // Wait for submission to complete
        await waitFor(() => {
            // Verify error toast was shown
            expect(mockToast).toHaveBeenCalledWith({
                title: "Error",
                description: "API error",
                variant: "destructive",
            })
        })
    })

    it('calls onClose when cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<ReportScheduler {...defaultProps} />)
        
        await user.click(screen.getByRole('button', { name: 'Cancel' }))
        
        expect(defaultProps.onClose).toHaveBeenCalled()
    })
    
    it('shows loading state during form submission', async () => {
        const user = userEvent.setup()
        
        // Delay the fetch response to show loading state
        vi.mocked(global.fetch).mockImplementationOnce(() => 
            new Promise(resolve => 
                setTimeout(() => resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                } as Response), 100)
            )
        )
        
        render(<ReportScheduler {...defaultProps} />)
        
        // Find the email input as we did in previous tests
        const inputs = screen.getAllByRole('textbox')
        const emailInput = inputs.find(input => 
            (input as HTMLInputElement).value !== 'Financial Report - Cardiology'
        )
        expect(emailInput).toBeTruthy()
        await user.type(emailInput!, 'test@example.com')
        
        // Submit the form
        await user.click(screen.getByRole('button', { name: 'Schedule Report' }))
        
        // Check loading state
        expect(screen.getByText('Scheduling...')).toBeInTheDocument()
    })
})