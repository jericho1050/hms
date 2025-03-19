import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PatientDetailsDialog } from '../../components/patients/patient-details-dialog'
import * as useAppointmentsModule from '@/hooks/use-appointments'
import * as usePatientDataModule from '@/hooks/use-patient'
import { format } from 'date-fns'
import type { Patient } from '@/types/patients'
import type { Appointment } from '@/types/appointments'
import { useState, useEffect } from 'react'

// Mock the Supabase client
vi.mock('@/utils/supabase/client', () => ({
    supabase: {
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnThis()
        })),
        removeChannel: vi.fn()
    }
}))

// Mock the useAppointments hook
vi.mock('@/hooks/use-appointments', () => ({
    useAppointments: vi.fn()
}))

// Mock the usePatientData hook
vi.mock('@/hooks/use-patient', () => ({
    usePatientData: vi.fn()
}))

// Mock date-fns to ensure consistent date formatting
vi.mock('date-fns', () => ({
    format: vi.fn().mockReturnValue('Mocked Date'),
    parseISO: vi.fn().mockReturnValue(new Date()),
    isSameDay: vi.fn()
}))

describe('PatientDetailsDialog', () => {
    const mockPatient: Patient = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phone: '555-123-4567',
        email: 'john.doe@example.com',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        status: 'Admitted' as const,
        maritalStatus: 'single',
        emergencyContactName: 'Jane Doe',
        emergencyContactRelationship: 'Spouse',
        emergencyContactPhone: '555-987-6543',
        insuranceProvider: 'Health Insurance Co',
        insuranceId: 'HIC123456789',
        insuranceGroupNumber: 'GRP123',
        bloodType: 'A+',
        allergies: ['Penicillin', 'Peanuts'],
        chronicConditions: 'Hypertension',
        currentMedications: 'Lisinopril 10mg',
        pastSurgeries: 'Appendectomy 2010',
        groupNumber: 'GRP123',
        policyHolderName: 'John Doe',
        relationshipToPatient: 'self' as const
    }

    const mockAppointments: Appointment[] = [
        {
            id: '1',
            patientId: '1',
            patientName: 'John Doe',
            doctorId: 'doc1',
            date: '2023-06-15',
            startTime: '09:00',
            endTime: '09:30',
            status: 'completed',
            department: 'Cardiology',
            doctorName: 'Dr. Smith',
            type: 'Check-up',
            notes: 'Patient reported feeling better.'
        },
        {
            id: '2',
            patientId: '1',
            patientName: 'John Doe',
            doctorId: 'doc2',
            date: '2023-07-20',
            startTime: '14:00',
            endTime: '14:30',
            status: 'scheduled',
            department: 'Neurology',
            doctorName: 'Dr. Johnson',
            type: 'Follow-up',
            notes: ''
        },
        {
            id: '3',
            patientId: '2',
            patientName: 'Jane Smith',
            doctorId: 'doc1',
            date: '2023-07-20',
            startTime: '15:00',
            endTime: '15:30',
            status: 'scheduled',
            department: 'Cardiology',
            doctorName: 'Dr. Smith',
            type: 'Initial consultation',
            notes: ''
        }
    ]

    const mockFetchAppointments = vi.fn().mockImplementation(() => {
        return Promise.resolve();
    });

    const mockFetchPatientBillingHistory = vi.fn().mockImplementation(() => {
        return Promise.resolve();
    });

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAppointmentsModule.useAppointments).mockReturnValue({
            appointments: mockAppointments,
            fetchAppointments: mockFetchAppointments,
            isLoading: false,
            filteredAppointments: [],
            stats: { totalToday: 0, completed: 0, noShows: 0, pending: 0 },
            filterAppointments: vi.fn(),
            handleStatusChange: vi.fn(),
            handleNewAppointment: vi.fn(),
            getAppointmentsForDate: vi.fn()
        })

        vi.mocked(usePatientDataModule.usePatientData).mockReturnValue({
            patients: [],
            isLoading: false,
            error: null,
            patientAdmissionsData: [],
            billingHistory: [],
            isBillingLoading: false,
            billingError: null,
            fetchPatients: vi.fn(),
            fetchPatientAdmissions: vi.fn(),
            fetchPatientBillingHistory: mockFetchPatientBillingHistory,
            createPatient: vi.fn(),
            updatePatient: vi.fn(),
            deletePatient: vi.fn(),
            handlePatientChange: vi.fn(),
            handleBillingChange: vi.fn()
        })
    })

    it('renders patient information correctly', () => {
        const { getByTestId } = render(
            <PatientDetailsDialog 
                patient={mockPatient} 
                isOpen={true} 
                onClose={() => {}}
            />
        )
        
        // Use data-testid to find elements
        expect(getByTestId('patient-full-name')).toHaveTextContent(`${mockPatient.firstName} ${mockPatient.lastName}`)
        expect(getByTestId('patient-phone')).toHaveTextContent(mockPatient.phone)
        expect(getByTestId('patient-email')).toHaveTextContent(mockPatient.email)
    })

    it('fetches appointments when opened', () => {
        render(
            <PatientDetailsDialog 
                patient={mockPatient} 
                isOpen={true} 
                onClose={() => {}}
            />
        )
        
        expect(mockFetchAppointments).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when close button is clicked', () => {
        const handleClose = vi.fn()
        const { getByTestId } = render(
            <PatientDetailsDialog 
                patient={mockPatient} 
                isOpen={true} 
                onClose={handleClose}
            />
        )
        
        // Find and click the close button using the data-testid
        const closeButton = getByTestId('close-button')
        fireEvent.click(closeButton)
        
        // Check if onClose was called
        expect(handleClose).toHaveBeenCalledTimes(1)
    })
})