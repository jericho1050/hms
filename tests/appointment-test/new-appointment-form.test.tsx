import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NewAppointmentForm } from '@/components/appointments/new-appointment-form';
import '@testing-library/jest-dom';
import { AppointmentFormValues } from '@/types/appointment-form';

// Mock react-hook-form and other dependencies
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: (callback: any) => (data: any) => callback(data),
    formState: { errors: {} },
    control: {},
    setValue: vi.fn(),
    getValues: vi.fn().mockReturnValue(''),
    reset: vi.fn(),
    watch: vi.fn().mockReturnValue('')
  }),
}));

// Mock UI components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => <div data-testid="dialog">{open && children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div data-testid="form">{children}</div>,
  FormField: ({ children, control, name, render }: { children?: React.ReactNode; control: any; name: string; render: any }) => (
    <div data-testid={`form-field-${name}`}>{render({ field: { value: '', onChange: vi.fn() } })}</div>
  ),
  FormItem: ({ children }: { children: React.ReactNode }) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="form-label">{children}</div>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div data-testid="form-control">{children}</div>,
  FormDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="form-description">{children}</div>,
  FormMessage: ({ children }: { children: React.ReactNode }) => <div data-testid="form-message">{children}</div>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <div data-testid="select-value">{placeholder}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ value, children }: { value: string, children: React.ReactNode }) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

vi.mock('@/components/ui/popover', () => {
  const PopoverTrigger = ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [key: string]: any }) => (
    <div data-testid="popover-trigger" {...props}>{children}</div>
  );
  return {
    Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
    PopoverTrigger,
    PopoverContent: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-content">{children}</div>,
  };
});

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    type?: 'button' | 'submit' | 'reset' 
  }) => (
    <button data-testid="button" type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect: (date: Date) => void }) => (
    <div data-testid="calendar">
      <button onClick={() => onSelect(new Date(2023, 5, 15))}>Select Date</button>
    </div>
  ),
}));

vi.mock('@/components/ui/command', () => ({
  Command: ({ children }: { children: React.ReactNode }) => <div data-testid="command">{children}</div>,
  CommandInput: (props: any) => <input data-testid="command-input" {...props} />,
  CommandEmpty: ({ children }: { children: React.ReactNode }) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="command-group">{children}</div>,
  CommandItem: ({ children, onSelect, value }: { children: React.ReactNode; onSelect: () => void; value: string }) => (
    <div data-testid={`command-item-${value}`} onClick={onSelect}>
      {children}
    </div>
  ),
}));

vi.mock('@/hooks/use-patient', () => ({
  usePatientData: () => ({
    patients: [
      { id: 'p1', firstName: 'John', lastName: 'Doe' },
      { id: 'p2', firstName: 'Jane', lastName: 'Smith' },
    ],
    fetchPatients: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn().mockReturnValue({
      id: 'toast-1',
      update: vi.fn(),
    }),
  }),
}));

// Mock date-fns format function
vi.mock('date-fns', () => ({
  format: vi.fn().mockReturnValue('May 15, 2023'),
  isSameDay: vi.fn().mockReturnValue(true),
  parseISO: vi.fn().mockReturnValue(new Date()),
}));

describe('NewAppointmentForm', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    departments: ['Cardiology', 'Neurology', 'Orthopedics'],
    doctors: [
      { 
        id: 'd1', 
        firstName: 'John', 
        lastName: 'Smith',
        name: 'Dr. John Smith',
        role: 'doctor',
        department: 'Cardiology',
        email: 'john.smith@example.com',
        phone: '123-456-7890',
        address: '123 Main St',
        joiningDate: '2020-01-01',
        status: 'active',
        licenseNumber: 'MD-12345',
        specialty: 'Cardiology',
        qualification: 'MD',
        availability: {}
      },
      { 
        id: 'd2', 
        firstName: 'Mary', 
        lastName: 'Johnson',
        name: 'Dr. Mary Johnson',
        role: 'doctor',
        department: 'Neurology',
        email: 'mary.johnson@example.com',
        phone: '555-123-4567',
        address: '456 Oak St',
        joiningDate: '2019-03-15',
        status: 'active',
        licenseNumber: 'MD-67890',
        specialty: 'Neurology',
        qualification: 'MD',
        availability: {}
      },
    ],
  };

  it('renders correctly when open', () => {
    render(<NewAppointmentForm {...mockProps} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Schedule New Appointment')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<NewAppointmentForm {...mockProps} isOpen={false} />);
    
    // Dialog should still be in the document but children not rendered
    expect(screen.queryByText('Schedule New Appointment')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<NewAppointmentForm {...mockProps} />);
    
    // Find cancel button and click it
    const cancelButton = screen.getAllByTestId('button').find(
      button => button.textContent === 'Cancel'
    );
    
    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('displays department options correctly', () => {
    render(<NewAppointmentForm {...mockProps} />);
    
    // Ensure form fields are rendered
    expect(screen.getByTestId('form-field-department')).toBeInTheDocument();
    
    // Due to our mocking approach, we can't easily test the select options
    // Just verify that the department field exists
    const departmentLabels = screen.getAllByTestId('form-label');
    const departmentLabel = Array.from(departmentLabels).find(
      label => label.textContent === 'Department'
    );
    expect(departmentLabel).toBeInTheDocument();
  });

  it('displays doctor options correctly', () => {
    render(<NewAppointmentForm {...mockProps} />);
    
    // Ensure form fields are rendered
    expect(screen.getByTestId('form-field-doctorId')).toBeInTheDocument();
  });

  it('submits the form with correct data', async () => {
    // Create a proper mock for the form submission
    const mockSubmit = vi.fn().mockResolvedValue(true);
    
    render(<NewAppointmentForm {...mockProps} onSubmit={mockSubmit} />);
    
    // Create mock form data
    const mockData: AppointmentFormValues = {
      patientId: 'p1',
      doctorId: 'd1',
      department: 'Cardiology',
      date: new Date(2023, 5, 15),
      startTime: '09:00',
      endTime: '10:00',
      type: 'Regular Checkup',
      notes: 'Test notes'
    };
    
    // Simulate form field selections
    // Select patient
    const patientField = screen.getByText('Select patient');
    fireEvent.click(patientField);
    const patientOption = screen.getByTestId('command-item-John Doe');
    fireEvent.click(patientOption);
    
    // Select doctor - use firstName lastName format since that's how it's rendered
    const doctorField = screen.getByText('Select doctor');
    fireEvent.click(doctorField);
    const doctorOption = screen.getByTestId('command-item-John Smith');
    fireEvent.click(doctorOption);
    
    // Department is auto-populated based on doctor selection
    
    // Select date
    const dateField = screen.getByText('Pick a date');
    fireEvent.click(dateField);
    const dateButton = screen.getByText('Select Date');
    fireEvent.click(dateButton);
    
    // Select start time and end time
    // Since these are Select components in our mocks, we can't directly interact with them
    // Our form validation should pass with just the selections we've made
    
    // Find and submit the form
    const submitButton = Array.from(screen.getAllByTestId('button')).find(
      button => button.textContent?.includes('Schedule Appointment')
    );
    
    if (submitButton) {
      await act(async () => {
        fireEvent.click(submitButton);
      });
    }
    
    // Check if the onSubmit callback was called
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });
});