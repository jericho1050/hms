import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoomDetailsDialog } from '../../components/rooms/room-details-dialog'
import { Room, RoomStatus } from '@/types/rooms'



const mockGetRoomHistory = vi.fn().mockResolvedValue({
    history: [
        { action: 'Bed assigned', timestamp: '2023-05-10 13:45', user: 'Dr. Smith' },
        { action: 'Room cleaned', timestamp: '2023-05-09 11:20', user: 'Housekeeping' }
    ],
    error: null
})

vi.mock('@/hooks/use-rooms', () => ({
    useRooms: () => ({
        getRoomHistory: mockGetRoomHistory
    })
}))

// Sample room data with explicit type annotation
const mockRoom: Room = {
    id: 'room-123',
    roomNumber: '101',
    name: 'Room 101',
    type: 'Standard',
    floor: '2',
    wing: 'East',
    departmentId: 'dept-1',
    status: 'available' as RoomStatus,
    facilities: ['Oxygen', 'Call Button'],
    notes: 'Recently renovated',
    beds: [
        {
            id: 'bed-1',
            name: 'Bed A',
            type: 'Standard',
            patientId: 'patient-123',
            patientName: 'John Doe',
            admissionDate: '2023-05-01',
            expectedDischargeDate: '2023-05-15',
            assignmentId: 'assign-1'
        },
        {
            id: 'bed-2',
            name: 'Bed B',
            type: 'Standard',
            patientId: null,
            patientName: undefined, // Changed from null to undefined
            admissionDate: undefined, // Changed from null to undefined
            expectedDischargeDate: undefined, // Changed from null to undefined
        }
    ]
}

const mockDepartment = {
    id: 'dept-1',
    name: 'Cardiology',
    color: '#FF5733'
}

describe('RoomDetailsDialog', () => {
    const onCloseMock = vi.fn()
    const onAssignBedMock = vi.fn()
    const onReleaseBedMock = vi.fn()
    
    beforeEach(() => {
        vi.clearAllMocks()
    })
    
    it('renders room details correctly', () => {
        render(
            <RoomDetailsDialog 
                room={mockRoom}
                department={mockDepartment}
                onClose={onCloseMock}
                onAssignBed={onAssignBedMock}
                onReleaseBed={onReleaseBedMock}
                getRoomHistory={vi.fn()}
            />
        )
        
        // Check basic room info is displayed
        expect(screen.getByText(`${mockRoom.type} - Room ${mockRoom.roomNumber}`)).toBeInTheDocument()
        expect(screen.getByText(`${mockDepartment.name} • Floor ${mockRoom.floor}`)).toBeInTheDocument()
    })
    
    it('shows correct tabs', () => {
        render(
            <RoomDetailsDialog 
                room={mockRoom}
                department={mockDepartment}
                onClose={onCloseMock}
                onAssignBed={onAssignBedMock}
                onReleaseBed={onReleaseBedMock}
                getRoomHistory={mockGetRoomHistory} 

            />
        )
        
        expect(screen.getByRole('tab', { name: /beds/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /room info/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /history/i })).toBeInTheDocument()
    })
    
    it('displays correct bed statuses', () => {
        render(
            <RoomDetailsDialog 
                room={mockRoom}
                department={mockDepartment}
                onClose={onCloseMock}
                onAssignBed={onAssignBedMock}
                onReleaseBed={onReleaseBedMock}
                getRoomHistory={mockGetRoomHistory}
            />
        )
        
        // Default tab should be beds
        expect(screen.getByText('Bed A')).toBeInTheDocument()
        expect(screen.getByText('Bed B')).toBeInTheDocument()
        
        // Check statuses
        expect(screen.getByText('Occupied')).toBeInTheDocument()
        expect(screen.getByText('Available')).toBeInTheDocument()
        
        // Check patient info for occupied bed
        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    it('shows room info when tab is clicked', async () => {
        render(
            <RoomDetailsDialog 
                room={mockRoom}
                department={mockDepartment}
                onClose={onCloseMock}
                onAssignBed={onAssignBedMock}
                onReleaseBed={onReleaseBedMock}
                getRoomHistory={mockGetRoomHistory} 
            />
        )
        
        const infoTab = screen.getByRole('tab', { name: /room info/i })
        await userEvent.click(infoTab)
        
        // Check room info content
        expect(screen.getByText('Room Details')).toBeInTheDocument()
        expect(screen.getByText('Facilities')).toBeInTheDocument()
        expect(screen.getByText('Oxygen')).toBeInTheDocument()
        expect(screen.getByText('Call Button')).toBeInTheDocument()
        expect(screen.getByText('Recently renovated')).toBeInTheDocument()
    })
    
    it('shows history when tab is clicked', async () => {
        render(
            <RoomDetailsDialog 
                room={mockRoom}
                department={mockDepartment}
                onClose={onCloseMock}
                onAssignBed={onAssignBedMock}
                onReleaseBed={onReleaseBedMock}
                getRoomHistory={mockGetRoomHistory} 
            />
        )
        
        const historyTab = screen.getByRole('tab', { name: /history/i })
        await userEvent.click(historyTab)
        
        await waitFor(() => {
            expect(screen.getByText('Recent Activity')).toBeInTheDocument()
            expect(screen.getByText('Bed assigned')).toBeInTheDocument()
            expect(screen.getByText('Room cleaned')).toBeInTheDocument()
        })
    })
    
    it('calls onAssignBed when assign button is clicked', async () => {
        render(
            <RoomDetailsDialog 
                room={mockRoom}
                department={mockDepartment}
                onClose={onCloseMock}
                onAssignBed={onAssignBedMock}
                onReleaseBed={onReleaseBedMock}

                getRoomHistory={mockGetRoomHistory} 
            />
        )
        
        // Find the assign button for the available bed
        const assignButton = screen.getByText('Assign Patient').closest('button')
        await userEvent.click(assignButton!)
        
        expect(onAssignBedMock).toHaveBeenCalledWith('bed-2')
    })
    
    it('opens release dialog when release button is clicked', async () => {
        render(
            <RoomDetailsDialog 
                room={mockRoom}
                department={mockDepartment}
                onClose={onCloseMock}
                onAssignBed={onAssignBedMock}
                onReleaseBed={onReleaseBedMock}
                getRoomHistory={mockGetRoomHistory}
            />
        )
        
        // Find the release button for the occupied bed
        const releaseButton = screen.getByText('Release Bed').closest('button')
        await userEvent.click(releaseButton!)
        
        // Check if release dialog opened
        expect(screen.getByText('Enter discharge notes (optional)')).toBeInTheDocument()
    })
    
    it('calls onReleaseBed with correct params when release is confirmed', async () => {
        render(
            <RoomDetailsDialog 
                room={mockRoom}
                department={mockDepartment}
                onClose={onCloseMock}
                onAssignBed={onAssignBedMock}
                onReleaseBed={onReleaseBedMock}
                getRoomHistory={mockGetRoomHistory}
            />
        )
        
        // Open release dialog
        const releaseButton = screen.getByText('Release Bed').closest('button')
        await userEvent.click(releaseButton!)
        
        // Enter notes
        const notesInput = screen.getByPlaceholderText('Enter discharge notes')
        await userEvent.type(notesInput, 'Patient discharged with follow-up')
        
        // Confirm release
        const confirmButton = screen.getByText('Confirm Release')
        await userEvent.click(confirmButton)
        
        // Check if onReleaseBed was called with correct parameters
        expect(onReleaseBedMock).toHaveBeenCalledWith('assignment-assign-1', 'Patient discharged with follow-up')
        expect(onCloseMock).toHaveBeenCalled()
    })
    
    it('calls onClose when Close button is clicked', async () => {
        render(
            <RoomDetailsDialog 
                room={mockRoom}
                department={mockDepartment}
                onClose={onCloseMock}
                onAssignBed={onAssignBedMock}
                onReleaseBed={onReleaseBedMock}
                getRoomHistory={mockGetRoomHistory}
            />
        )
        
        const closeButton = screen.getAllByRole('button', { name: 'Close' })
        await userEvent.click(closeButton[0])
        
        expect(onCloseMock).toHaveBeenCalled()
    })
})