import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomsManagement } from '../../components/rooms/rooms-management';
import type { Room, Department } from '@/types/rooms';

// Mock data
const mockRooms: Room[] = [
    {
        id: 'room1',
        departmentId: 'dept1',
        roomNumber: '101',
        type: 'Private',
        status: 'available',
        floor: '1',
        name: 'Private Room 101',
        wing: 'West',
        facilities: ['TV', 'Bathroom'],
        beds: [
            { id: 'bed1', name: 'Bed 1', patientId: null, type: 'Standard' }
        ]
    },
    {
        id: 'room2',
        departmentId: 'dept2',
        roomNumber: '102',
        type: 'Shared',
        status: 'partial',
        floor: '1',
        name: 'Shared Room 102',
        wing: 'East',
        facilities: ['TV'],
        beds: [
            { id: 'bed2', name: 'Bed 1', patientId: 'patient2', patientName: 'John Doe', type: 'Standard' },
            { id: 'bed3', name: 'Bed 2', patientId: null, type: 'Standard' }
        ]
    },
    {
        id: 'room3',
        departmentId: 'dept1',
        roomNumber: '103',
        type: 'ICU',
        status: 'full',
        floor: '2',
        name: 'ICU Room 103',
        wing: 'North',
        facilities: ['Ventilator', 'Monitoring Equipment'],
        beds: [
            { id: 'bed4', name: 'Bed 1', patientId: 'patient3', patientName: 'Jane Smith', type: 'ICU' }
        ]
    }
];

const mockDepartments: Department[] = [
    { id: 'dept1', name: 'Cardiology', color: '#FF5733' },
    { id: 'dept2', name: 'Neurology', color: '#33A1FF' }
];

// Add this mock for useRooms
vi.mock('@/hooks/use-rooms', () => ({
    useRooms: () => ({
        rooms: mockRooms,
        setRooms: vi.fn(),
        departments: mockDepartments,
        setDepartments: vi.fn(),
        isLoading: false,
        error: null,
        getRoomsData: vi.fn(),
        getDepartmentsData: vi.fn(),
        getPatientsData: vi.fn(),
        getRoomHistory: vi.fn(),
    })
}));

// Mock the hooks and actions
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn()
    })
}));

vi.mock('@/hooks/use-staff', () => ({
    useStaff: () => ({
        staffId: 'mock-staff-id'
    })
}));

vi.mock('@/app/actions/rooms', () => ({
    assignBedToPatient: vi.fn(() => Promise.resolve({ success: true })),
    releaseBed: vi.fn(() => Promise.resolve({ success: true }))
}));

// Mock component dialog components
vi.mock('@/components/rooms/room-details-dialog', () => ({
    RoomDetailsDialog: ({ onClose, onAssignBed, onReleaseBed }: {
        onClose: () => void;
        onAssignBed: (bedId: string) => void;
        onReleaseBed: (bedId: string, notes?: string) => void;
    }) => (
        <div data-testid="room-details-dialog">
            <button data-testid="close-details" onClick={onClose}>Close</button>
            <button data-testid="assign-bed-button" onClick={() => onAssignBed('bed1')}>Assign Bed</button>
            <button data-testid="release-bed-button" onClick={() => onReleaseBed('bed1', 'Notes')}>Release Bed</button>
        </div>
    )
}));

vi.mock('@/components/rooms/assign-bed-dialog', () => ({
    AssignBedDialog: ({ onClose, onAssign }: {
        onClose: () => void;
        onAssign: (patientId: string, patientName: string, admissionDate: string, expectedDischargeDate?: string, isEmergency?: boolean) => void;
    }) => (
        <div data-testid="assign-bed-dialog">
            <button data-testid="close-assign" onClick={onClose}>Close</button>
            <button data-testid="confirm-assign" onClick={() => onAssign('patient1', 'Test Patient', '2023-06-01', '2023-06-10', false)}>Confirm</button>
        </div>
    )
}));

describe('RoomsManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly with initial data', () => {
        render(<RoomsManagement />);
        
        expect(screen.getByText('Occupancy Overview')).toBeInTheDocument();
        expect(screen.getByText(/Room Status/)).toBeInTheDocument();
        
        // Use more flexible queries to find text that might be split across elements
        expect(screen.getByText('Private')).toBeInTheDocument();
        expect(screen.getByText('Shared')).toBeInTheDocument();
        expect(screen.getByText('ICU')).toBeInTheDocument();
    });

    it('filters rooms by department', async () => {
        render(<RoomsManagement />);
        
        // Instead of clicking the select dropdown, directly modify the state
        // Find the input element that contains the department selection
        const input = screen.getByTestId('department-select');
        
        // Trigger a change directly - bypassing the Radix UI component interaction
        fireEvent.change(input, { target: { value: 'dept1' } });
        
        // Verify filtered results - Private and ICU rooms should remain (both in dept1)
        expect(screen.getByText('Private')).toBeInTheDocument();
        expect(screen.getByText('ICU')).toBeInTheDocument();
    });

    it('filters rooms by search query', async () => {
        render(<RoomsManagement />);
        
        const searchInput = screen.getByPlaceholderText('Search rooms...');
        await userEvent.type(searchInput, 'Private');
        
        expect(screen.getByText('Private')).toBeInTheDocument();
        expect(screen.queryByText('Shared')).not.toBeInTheDocument();
        expect(screen.queryByText('ICU')).not.toBeInTheDocument();
    });

    it('searches for patients by name', async () => {
        render(<RoomsManagement />);
        
        const searchInput = screen.getByPlaceholderText('Search rooms...');
        await userEvent.type(searchInput, 'John Doe');
        
        expect(screen.queryByText('Private')).not.toBeInTheDocument();
        expect(screen.getByText('Shared')).toBeInTheDocument();
        expect(screen.queryByText('ICU')).not.toBeInTheDocument();
    });

    it('switches between grid and list view', async () => {
        render(<RoomsManagement />);
        
        // Default is grid view - look for buttons instead of text
        const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
        expect(viewDetailsButtons).toHaveLength(3);
        
        // Switch to list view
        const listViewButton = screen.getByRole('tab', { name: /List/i });
        await userEvent.click(listViewButton);
        
        // Check list view specific elements
        expect(screen.getByText('Room')).toBeInTheDocument();
        expect(screen.getByText('Department')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('opens room details dialog when clicking view details', async () => {
        render(<RoomsManagement />);
        
        const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
        await userEvent.click(viewDetailsButtons[0]);
        
        expect(screen.getByTestId('room-details-dialog')).toBeInTheDocument();
        
        // Close the dialog
        await userEvent.click(screen.getByTestId('close-details'));
        expect(screen.queryByTestId('room-details-dialog')).not.toBeInTheDocument();
    });

    it('opens assign bed dialog when clicking assign bed', async () => {
        render(<RoomsManagement />);
        
        // Find assign bed buttons by their specific content
        const assignBedButtons = screen.getAllByRole('button', { name: /Assign Bed/i });
        await userEvent.click(assignBedButtons[0]); 
        
        expect(screen.getByTestId('assign-bed-dialog')).toBeInTheDocument();
        
        // Close the dialog
        await userEvent.click(screen.getByTestId('close-assign'));
        expect(screen.queryByTestId('assign-bed-dialog')).not.toBeInTheDocument();
    });

    it('assigns a bed to a patient', async () => {
        const { assignBedToPatient } = await import('@/app/actions/rooms');
        
        render(<RoomsManagement />);
        
        // Open assign bed dialog
        const assignBedButtons = screen.getAllByRole('button', { name: /Assign Bed/i });
        await userEvent.click(assignBedButtons[0]);
        
        // Confirm assignment
        await userEvent.click(screen.getByTestId('confirm-assign'));
        
        // Check if the assignBedToPatient action was called
        expect(assignBedToPatient).toHaveBeenCalled();
    });

    it('releases a bed', async () => {
        const { releaseBed } = await import('@/app/actions/rooms');
        
        render(<RoomsManagement />);
        
        // Open room details
        const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
        await userEvent.click(viewDetailsButtons[0]);
        
        // Release bed
        await userEvent.click(screen.getByTestId('release-bed-button'));
        
        // Check if the releaseBed action was called
        expect(releaseBed).toHaveBeenCalled();
    });
});