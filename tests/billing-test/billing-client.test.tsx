import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BillingClient from '@/components/billing/billing-client';
import { BillingWithPatient } from '@/types/billing';

// Mock the mail library to avoid the mailgun.js error
vi.mock('@/lib/mail', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true })
}));

// Mock app actions that might use the mail library
vi.mock('@/app/actions/billing', () => ({
  sendInvoiceEmail: vi.fn().mockResolvedValue({ success: true }),
  processPayment: vi.fn().mockResolvedValue({ success: true })
}));

// Create mock billing records
const mockBillingRecords: BillingWithPatient[] = [
  {
    id: 'invoice-1',
    patient_id: 'patient-1',
    invoice_date: '2023-05-01',
    due_date: '2023-06-01',
    total_amount: 150.00,
    payment_status: 'paid',
    created_at: '2023-05-01',
    updated_at: '2023-05-01',
    patient: {
      id: 'patient-1',
      first_name: 'John',
      last_name: 'Doe'
    }
  },
  {
    id: 'invoice-2',
    patient_id: 'patient-2',
    invoice_date: '2023-05-02',
    due_date: '2023-06-02',
    total_amount: 200.00,
    payment_status: 'pending',
    created_at: '2023-05-02',
    updated_at: '2023-05-02',
    patient: {
      id: 'patient-2',
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
];

// Mock billing stats
const mockBillingStats = {
  totalMonthlyRevenue: 1500.00,
  totalOutstanding: 500.00,
  recentTransactions: [{ id: 'invoice-1' }, { id: 'invoice-2' }]
};

// Mock fetch functions
const mockFetchBillingRecords = vi.fn();
const mockFetchBillingStats = vi.fn();
const mockDeleteBilling = vi.fn().mockResolvedValue({ success: true });

// Mock the useBilling hook
vi.mock('@/hooks/use-billing', () => ({
  useBilling: () => ({
    isLoading: false,
    records: mockBillingRecords,
    stats: mockBillingStats,
    fetchBillingRecords: mockFetchBillingRecords,
    fetchBillingStats: mockFetchBillingStats,
    deleteBilling: mockDeleteBilling
  })
}));

// Mock the formatCurrency function
vi.mock('@/lib/utils', () => ({
  formatCurrency: (val: number) => `$${val.toFixed(2)}`,
  formatDate: (date: string) => date,
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' ')
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('BillingClient Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<BillingClient />);
    
    // Check that the header is rendered
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    
    // Check that the stat cards are rendered
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('Outstanding Payments')).toBeInTheDocument();
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    
    // Check that the buttons are rendered
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Create Invoice')).toBeInTheDocument();
  });

  it('fetches billing records and stats on mount', () => {
    render(<BillingClient />);
    
    // Check that the fetch functions were called
    expect(mockFetchBillingRecords).toHaveBeenCalledTimes(1);
    expect(mockFetchBillingStats).toHaveBeenCalledTimes(1);
  });

  it('displays the correct record count in Recent Transactions', () => {
    render(<BillingClient />);
    
    // Find the New billing records text first
    const newBillingText = screen.getByText('New billing records in the last 30 days');
    
    // Then look for the count nearby, using the parent element as context
    const transactionCard = newBillingText.closest('div.space-y-1') || newBillingText.parentElement;
    expect(transactionCard).not.toBeNull();
    
    // Find the element with the transaction count within this context
    const countElements = screen.getAllByText('2');
    
    // At least one of the elements with '2' should be near our text
    const hasNearbyCountElement = countElements.some(element => 
      transactionCard?.contains(element) || 
      element.parentElement?.contains(transactionCard) ||
      element.parentElement?.parentElement?.contains(transactionCard)
    );
    
    expect(hasNearbyCountElement).toBe(true);
    expect(screen.getByText('New billing records in the last 30 days')).toBeInTheDocument();
  });
}); 