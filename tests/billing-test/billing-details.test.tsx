import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import BillingDetails from '@/components/billing/billing-details';
import { BillingWithPatient } from '@/types/billing';

// Mock loading state to control it per test
let mockIsLoading = false;

// Mock the hooks
vi.mock('@/hooks/use-billing', () => ({
  useBilling: () => ({
    isLoading: mockIsLoading
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock the format function from utils
vi.mock('@/lib/utils', () => ({
  formatCurrency: (val: number) => `$${val.toFixed(2)}`,
  formatDate: () => 'May 1, 2023',
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' ')
}));

// Mock the app actions
vi.mock('@/app/actions/billing', () => ({
  sendInvoiceEmail: vi.fn().mockResolvedValue({ success: true, message: 'Email sent successfully' }),
  processPayment: vi.fn().mockResolvedValue({ success: true, message: 'Payment processed successfully' })
}));

describe('BillingDetails Component', () => {
  // Mock billing record data
  const mockBillingRecord: BillingWithPatient = {
    id: 'invoice-123',
    patient_id: 'patient-123',
    invoice_date: '2023-05-01',
    due_date: '2023-06-01',
    total_amount: 150.00,
    payment_status: 'pending',
    created_at: '2023-05-01',
    updated_at: '2023-05-01',
    payment_method: 'credit_card',
    payment_date: null,
    notes: 'Test invoice',
    services: [
      {
        name: 'Medical Consultation',
        quantity: 1,
        price: 150.00
      }
    ],
    patient: {
      id: 'patient-123',
      first_name: 'John',
      last_name: 'Doe'
    }
  };
  
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false; // Reset loading state before each test
  });
  
  it('renders the component correctly', () => {
    render(
      <BillingDetails
        billingId={mockBillingRecord.id}
        billingRecord={mockBillingRecord}
        onClose={mockOnClose}
      />
    );
    
    // Check that invoice header section exists
    const header = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'h3' && content.includes('Invoice #');
    });
    expect(header).toBeInTheDocument();
    
    // Check that patient information is rendered
    expect(screen.getByText('Patient Information')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('John') && content.includes('Doe'))).toBeInTheDocument();
    
    // Check that invoice details are rendered
    expect(screen.getByText('Invoice Details')).toBeInTheDocument();
    expect(screen.getByText('Invoice Date')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    
    // Check that payment status is displayed
    expect(screen.getByText('pending')).toBeInTheDocument();
    
    // Check that services section is rendered
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Medical Consultation')).toBeInTheDocument();
  });
  
  it('renders the loading state correctly', () => {
    // Set loading state to true for this test
    mockIsLoading = true;
    
    render(
      <BillingDetails
        billingId={mockBillingRecord.id}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Loading invoice details...')).toBeInTheDocument();
  });
  
  it('renders services correctly when no services are provided', () => {
    const recordWithNoServices = {
      ...mockBillingRecord,
      services: []
    };
    
    render(
      <BillingDetails
        billingId={recordWithNoServices.id}
        billingRecord={recordWithNoServices}
        onClose={mockOnClose}
      />
    );
    
    // Use a more flexible approach to finding the "No services found" text
    const noServicesElement = screen.getByText((content) => {
      return content.includes('No services found');
    });
    expect(noServicesElement).toBeInTheDocument();
  });
}); 