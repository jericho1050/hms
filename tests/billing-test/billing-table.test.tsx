import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BillingTable from '@/components/billing/billing-table';
import { BillingWithPatient } from '@/types/billing';

// Mock jsPDF
vi.mock('jspdf', () => {
  const mockJsPDF = vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    setFont: vi.fn(),
    line: vi.fn(),
    internal: {
      pageSize: {
        getWidth: vi.fn().mockReturnValue(210),
        getHeight: vi.fn().mockReturnValue(297),
      },
    },
    save: vi.fn(),
    output: vi.fn().mockImplementation((type) => {
      if (type === 'blob') return new Blob(['fake pdf content']);
      if (type === 'datauristring') return 'data:application/pdf;base64,fakePdfContent';
      return '';
    }),
  }));
  
  return {
    jsPDF: mockJsPDF
  };
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn().mockImplementation(() => 'blob:fake-url');
global.URL.revokeObjectURL = vi.fn();

// Mock window.open
global.open = vi.fn();

// Create mock data
const mockBillingRecords: BillingWithPatient[] = Array.from({ length: 15 }).map((_, index) => ({
  id: `invoice-${index + 1}`,
  patient_id: `patient-${index + 1}`,
  invoice_date: '2023-05-01',
  due_date: '2023-06-01',
  total_amount: 100 + index * 10,
  payment_status: index % 5 === 0 ? 'paid' : 
                  index % 5 === 1 ? 'pending' : 
                  index % 5 === 2 ? 'overdue' : 
                  index % 5 === 3 ? 'cancelled' : 'partially_paid',
  created_at: '2023-05-01',
  updated_at: '2023-05-01',
  patient: {
    id: `patient-${index + 1}`,
    first_name: `John${index}`,
    last_name: `Doe${index}`,
  }
}));

// Mock handlers
const mockViewDetails = vi.fn();
const mockEdit = vi.fn();
const mockDelete = vi.fn();

describe('BillingTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders without crashing', () => {
    render(
      <BillingTable
        records={mockBillingRecords}
        isLoading={false}
        onViewDetails={mockViewDetails}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    );
    
    // Verify the table is in the document
    expect(document.querySelector('table')).toBeInTheDocument();
  });
  
  it('renders loading state correctly', () => {
    const { container } = render(
      <BillingTable
        records={[]}
        isLoading={true}
        onViewDetails={mockViewDetails}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    );
    
    // Check for skeleton loaders
    const skeletons = container.querySelectorAll('.h-4');
    expect(skeletons.length).toBeGreaterThan(0);
  });
  
  it('renders empty state correctly', () => {
    render(
      <BillingTable
        records={[]}
        isLoading={false}
        onViewDetails={mockViewDetails}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    );
    
    expect(screen.getByText('No billing records found')).toBeInTheDocument();
  });
  
  it('renders table headers correctly', () => {
    render(
      <BillingTable
        records={mockBillingRecords}
        isLoading={false}
        onViewDetails={mockViewDetails}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    );
    
    // Check for table headers
    expect(screen.getByText('Invoice #')).toBeInTheDocument();
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
}); 