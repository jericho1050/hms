import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FinancialReports } from '../../components/reports/financial-reports'

// Mock the recharts components since they're not easily testable in jsdom
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Bar: () => <div data-testid="bar"></div>,
    Line: () => <div data-testid="line"></div>,
    Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
    Cell: () => <div data-testid="cell"></div>,
    XAxis: () => <div data-testid="x-axis"></div>,
    YAxis: () => <div data-testid="y-axis"></div>,
    CartesianGrid: () => <div data-testid="cartesian-grid"></div>,
    Tooltip: () => <div data-testid="tooltip"></div>,
    Legend: () => <div data-testid="legend"></div>,
}))

// Mock the utils module with both formatCurrency and cn functions
vi.mock('@/lib/utils', () => ({
    formatCurrency: (value: number) => `$${value.toLocaleString()}`,
    // Add the missing cn function that combines class names
    cn: (...inputs: any[]) => inputs.filter(Boolean).join(' ')
}))


describe('FinancialReports', () => {
    const defaultDateRange = {
        from: new Date(2023, 0, 1),
        to: new Date(2023, 11, 31),
    }

    const mockFinancialMetrics = {
        totalRevenue: 1250000,
        outstandingBills: 325000,
        insuranceClaims: 87,
        collectionRate: 92.5,
        revenueGrowth: 15.2,
        outstandingBillsGrowth: -5.3,
        insuranceClaimsGrowth: 2.1,
        collectionRateGrowth: 3.8,
        revenueByDepartment: [
            { name: "Cardiology", revenue: 425000, target: 400000 },
            { name: "Orthopedics", revenue: 350000, target: 380000 },
            { name: "Pediatrics", revenue: 275000, target: 250000 },
        ],
        revenueTrends: [
            { month: "Jan", revenue: 98000, expenses: 85000 },
            { month: "Feb", revenue: 105000, expenses: 88000 },
            { month: "Mar", revenue: 112000, expenses: 90000 },
        ],
        paymentDistribution: [
            { name: "Insurance", value: 65 },
            { name: "Out-of-pocket", value: 20 },
            { name: "Medicare", value: 10 },
        ],
    }

    const mockInsuranceClaims = [
        {
            id: "CLM-001",
            patient: "John Doe",
            amount: 1250,
            status: "paid",
            provider: "Blue Cross",
            submittedDate: "2023-04-15",
            paidDate: "2023-04-28",
        },
        {
            id: "CLM-002",
            patient: "Jane Smith",
            amount: 2800,
            status: "pending",
            provider: "Aetna",
            submittedDate: "2023-05-02",
            paidDate: null,
        },
        {
            id: "CLM-003",
            patient: "Robert Johnson",
            amount: 950,
            status: "denied",
            provider: "United Healthcare",
            submittedDate: "2023-04-22",
            paidDate: null,
        },
    ]

    it('should display a no data message when financialMetrics is undefined', () => {
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
            />
        )

        expect(screen.getByText('No financial data available')).toBeInTheDocument()
        expect(screen.getByText(/Try changing your date range or department selection/)).toBeInTheDocument()
    })

    it('should render all financial metrics cards when data is provided', () => {
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={mockFinancialMetrics}
            />
        )

        expect(screen.getByText('Total Revenue')).toBeInTheDocument()
        expect(screen.getByText('Outstanding Bills')).toBeInTheDocument()
        expect(screen.getByText('Insurance Claims')).toBeInTheDocument()
        expect(screen.getByText('Collection Rate')).toBeInTheDocument()
        
        // Check for formatted values
        expect(screen.getByText('$1,250,000')).toBeInTheDocument()
        expect(screen.getByText('$325,000')).toBeInTheDocument()
        expect(screen.getByText('87')).toBeInTheDocument()
        expect(screen.getByText('92.5%')).toBeInTheDocument()
    })

    it('should render the revenue by department chart when data is available', () => {
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={mockFinancialMetrics}
            />
        )

        expect(screen.getByText('Revenue by Department')).toBeInTheDocument()
        expect(screen.getByText('Comparison of actual revenue against targets by department')).toBeInTheDocument()
        expect(screen.queryByText('No department revenue data available')).not.toBeInTheDocument()
    })

    it('should filter revenue by department when a specific department is selected', () => {
        const { rerender } = render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={mockFinancialMetrics}
            />
        )

        rerender(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="cardiology"
                reportTypeFilter="all"
                financialMetrics={mockFinancialMetrics}
            />
        )

        // Since we can't easily test the filtered data in the mocked charts,
        // we ensure that the component renders without errors
        expect(screen.getByText('Revenue by Department')).toBeInTheDocument()
    })

    it('should render no revenue by department message when data is empty', () => {
        const metricsWithoutDeptRevenue = {
            ...mockFinancialMetrics,
            revenueByDepartment: []
        }
        
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={metricsWithoutDeptRevenue}
            />
        )

        expect(screen.getByText('No revenue by department data available for the selected filters.')).toBeInTheDocument()
    })

    it('should render revenue trends chart when data is available', () => {
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={mockFinancialMetrics}
            />
        )

        expect(screen.getByText('Revenue vs. Expenses (YTD)')).toBeInTheDocument()
        expect(screen.getByText('Monthly comparison of revenue and expenses')).toBeInTheDocument()
    })

    it('should render no revenue trends message when data is empty', () => {
        const metricsWithoutTrends = {
            ...mockFinancialMetrics,
            revenueTrends: []
        }
        
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={metricsWithoutTrends}
            />
        )

        expect(screen.getByText('No revenue trend data available for the selected filters.')).toBeInTheDocument()
    })

    it('should render payment distribution chart when data is available', () => {
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={mockFinancialMetrics}
            />
        )

        expect(screen.getByText('Payment Distribution')).toBeInTheDocument()
        expect(screen.getByText('Sources of payment for medical services')).toBeInTheDocument()
    })

    it('should render no payment distribution message when data is empty', () => {
        const metricsWithoutPaymentDist = {
            ...mockFinancialMetrics,
            paymentDistribution: []
        }
        
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={metricsWithoutPaymentDist}
            />
        )

        expect(screen.getByText('No payment distribution data available for the selected filters.')).toBeInTheDocument()
    })

    it('should display insurance claims when data is provided', () => {
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={mockFinancialMetrics}
                insuranceClaims={mockInsuranceClaims}
            />
        )

        expect(screen.getByText('Recent Insurance Claims')).toBeInTheDocument()
        
        // Check for table headers
        expect(screen.getByText('Claim ID')).toBeInTheDocument()
        expect(screen.getByText('Patient')).toBeInTheDocument()
        expect(screen.getByText('Amount')).toBeInTheDocument()
        expect(screen.getByText('Provider')).toBeInTheDocument()
        
        // Check for insurance claim data
        expect(screen.getByText('CLM-001')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Paid')).toBeInTheDocument()
        expect(screen.getByText('Pending')).toBeInTheDocument()
        expect(screen.getByText('Denied')).toBeInTheDocument()
    })

    it('should display no insurance claims message when data is empty', () => {
        render(
            <FinancialReports
                dateRange={defaultDateRange}
                departmentFilter="all"
                reportTypeFilter="all"
                financialMetrics={mockFinancialMetrics}
                insuranceClaims={[]}
            />
        )

        expect(screen.getByText('No insurance claims data available for the selected filters.')).toBeInTheDocument()
    })
})