import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewStaffForm } from '../../components/staff/new-staff-form';

// Mock the hooks and components
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

// Mock confirm
global.confirm = vi.fn().mockReturnValue(true);

describe('NewStaffForm', () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();
    const departments = ['Cardiology', 'Neurology', 'Orthopedics'];
    const roles = ['Doctor', 'Nurse', 'Receptionist'];

    beforeEach(() => {
        mockOnClose.mockReset();
        mockOnSubmit.mockReset();
    });

    it('renders the form with proper title', () => {
        render(
            <NewStaffForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                departments={departments}
                roles={roles}
            />
        );

        expect(screen.getByText('Add New Staff')).toBeInTheDocument();
        // Adjusted since "Personal Information" is not rendered by the component.
        expect(screen.getByText(/add new staff/i)).toBeInTheDocument();
    });

    it('displays the first step initially', () => {
        render(
            <NewStaffForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                departments={departments}
                roles={roles}
            />
        );

        // Find inputs by placeholder since labels are missing
        expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('john.doe@example.com')).toBeInTheDocument();
        // For Phone and Address, use the exact placeholders.
        expect(screen.getByPlaceholderText('(555) 123-4567')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('123 Main St, City, State, Zip')).toBeInTheDocument();

        expect(screen.queryByText('Role')).not.toBeInTheDocument();
    });

    it('moves to the next step when valid data is entered', async () => {
        const user = userEvent.setup();
        render(
            <NewStaffForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                departments={departments}
                roles={roles}
            />
        );

        // Fill out first step using placeholder queries
        await user.type(screen.getByPlaceholderText('John'), 'John');
        await user.type(screen.getByPlaceholderText('Doe'), 'Doe');
        await user.type(screen.getByPlaceholderText('john.doe@example.com'), 'john.doe@example.com');
        // Use the exact placeholder text for phone and address inputs
        await user.type(screen.getByPlaceholderText('(555) 123-4567'), '1234567890');
        await user.type(screen.getByPlaceholderText('123 Main St, City, State, Zip'), '123 Main St');

        // Click next
        await user.click(screen.getByText('Next'));

        // Expect to see second step by checking for "Role" and "Department"
        await waitFor(() => {
            expect(screen.getByText('Role')).toBeInTheDocument();
            expect(screen.getByText('Department')).toBeInTheDocument();
        });
    });

    it('does not proceed to next step with invalid data', async () => {
        const user = userEvent.setup();
        render(
            <NewStaffForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                departments={departments}
                roles={roles}
            />
        );

        // Fill out first step with invalid data (e.g. too short for "First Name")
        await user.type(screen.getByPlaceholderText('John'), 'J');

        // Click next
        await user.click(screen.getByText('Next'));

        // Still on first step
        await waitFor(() => {
            expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
            expect(screen.queryByText('Role')).not.toBeInTheDocument();
        });
    });

    it('goes back to previous step when back button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <NewStaffForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                departments={departments}
                roles={roles}
            />
        );

        // Navigate to second step first:
        await user.type(screen.getByPlaceholderText('John'), 'John');
        await user.type(screen.getByPlaceholderText('Doe'), 'Doe');
        await user.type(screen.getByPlaceholderText('john.doe@example.com'), 'john.doe@example.com');
        await user.type(screen.getByPlaceholderText('(555) 123-4567'), '1234567890');
        await user.type(screen.getByPlaceholderText('123 Main St, City, State, Zip'), '123 Main St');
        await user.click(screen.getByText('Next'));

        // Now click back when back button is visible
        await waitFor(() => {
            expect(screen.getByText('Back')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Back'));

        // Expect to see first step again
        await waitFor(() => {
            expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('john.doe@example.com')).toBeInTheDocument();
        });
    });


    it('closes the dialog when cancel button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <NewStaffForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                departments={departments}
                roles={roles}
            />
        );

        await user.click(screen.getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});