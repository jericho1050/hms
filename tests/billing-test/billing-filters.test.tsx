import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BillingFilters from '@/components/billing/billing-filters';
import { BillingFilter } from '@/types/billing';

// Mock date-fns format function
vi.mock('date-fns', () => ({
  format: vi.fn().mockImplementation(() => 'January 1, 2023')
}));

describe('BillingFilters Component', () => {
  const mockFilters: BillingFilter = {};
  const mockSearchTerm = '';
  const mockSetSearchTerm = vi.fn();
  const mockOnFilterChange = vi.fn();
  const mockOnResetFilters = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(
      <BillingFilters
        filters={mockFilters}
        searchTerm={mockSearchTerm}
        setSearchTerm={mockSetSearchTerm}
        onFilterChange={mockOnFilterChange}
        onResetFilters={mockOnResetFilters}
      />
    );

    // Check that the search input is rendered
    expect(screen.getByLabelText('Search Patient')).toBeInTheDocument();
    
    // Check that the payment status select is rendered
    expect(screen.getByLabelText('Payment Status')).toBeInTheDocument();
    
    // Check that date pickers are rendered
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    
    // Check that clear filters button is rendered
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('updates search term and calls onFilterChange when typing in search input', () => {
    render(
      <BillingFilters
        filters={mockFilters}
        searchTerm={mockSearchTerm}
        setSearchTerm={mockSetSearchTerm}
        onFilterChange={mockOnFilterChange}
        onResetFilters={mockOnResetFilters}
      />
    );

    const searchInput = screen.getByLabelText('Search Patient');
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });

    // Check that setSearchTerm and onFilterChange were called with the correct value
    expect(mockSetSearchTerm).toHaveBeenCalledWith('John Doe');
    expect(mockOnFilterChange).toHaveBeenCalledWith('searchTerm', 'John Doe');
  });

  it('calls onResetFilters when clear filters button is clicked', () => {
    render(
      <BillingFilters
        filters={mockFilters}
        searchTerm={mockSearchTerm}
        setSearchTerm={mockSetSearchTerm}
        onFilterChange={mockOnFilterChange}
        onResetFilters={mockOnResetFilters}
      />
    );

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    // Check that onResetFilters was called
    expect(mockOnResetFilters).toHaveBeenCalled();
  });

  it('renders with applied filters correctly', () => {
    const filtersWithValues: BillingFilter = {
      paymentStatus: 'paid',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31')
    };

    render(
      <BillingFilters
        filters={filtersWithValues}
        searchTerm="John"
        setSearchTerm={mockSetSearchTerm}
        onFilterChange={mockOnFilterChange}
        onResetFilters={mockOnResetFilters}
      />
    );

    // Check that search input has the correct value
    const searchInput = screen.getByLabelText('Search Patient') as HTMLInputElement;
    expect(searchInput.value).toBe('John');

    // Check that start date and end date buttons show the formatted date
    const dateButtons = screen.getAllByText('January 1, 2023');
    expect(dateButtons.length).toBe(2);
  });
}); 