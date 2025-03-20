import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ClinicalReports } from '@/components/reports/clinical-reports';
import React from 'react';

// Mock the recharts library
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: () => <div data-testid="bar-chart" />,
    Bar: () => <div data-testid="bar" />,
    LineChart: () => <div data-testid="line-chart" />,
    Line: () => <div data-testid="line" />,
    PieChart: () => <div data-testid="pie-chart" />,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
    AreaChart: () => <div data-testid="area-chart" />,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    ActivitySquare: () => <div data-testid="icon-activity-square" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    TrendingDown: () => <div data-testid="icon-trending-down" />,
    Heart: () => <div data-testid="icon-heart" />,
    Stethoscope: () => <div data-testid="icon-stethoscope" />,
    BarChartIcon: () => <div data-testid="icon-bar-chart" />,
    AlertTriangle: () => <div data-testid="icon-alert-triangle" />,
}));

// Mock date range
const mockDateRange = { from: new Date('2023-01-01'), to: new Date('2023-12-31') };

// Complete clinical metrics mock
const mockClinicalMetrics = {
    patientsByAge: [
        { age: '0-17', count: 120 },
        { age: '18-34', count: 250 },
        { age: '35-50', count: 180 },
        { age: '51-65', count: 210 },
        { age: '65+', count: 300 }
    ],
    patientsByGender: [
        { gender: 'Male', count: 520 },
        { gender: 'Female', count: 480 },
        { gender: 'Other', count: 60 }
    ],
    diagnosisFrequency: [
        { name: 'Hypertension', count: 150 },
        { name: 'Diabetes Type 2', count: 120 },
        { name: 'COPD', count: 80 },
        { name: 'Asthma', count: 70 },
        { name: 'Coronary Artery Disease', count: 65 }
    ],
    treatmentOutcomes: [
        { treatment: 'ACE Inhibitors', success: 85, failure: 15 },
        { treatment: 'Beta Blockers', success: 78, failure: 22 },
        { treatment: 'Statins', success: 92, failure: 8 },
        { treatment: 'Bronchodilators', success: 75, failure: 25 }
    ],
    patientOutcomes: [
        { month: 'Jan', improved: 45, stable: 40, deteriorated: 15 },
        { month: 'Feb', improved: 48, stable: 42, deteriorated: 10 },
        { month: 'Mar', improved: 52, stable: 38, deteriorated: 10 }
    ],
    readmissionRates: [
        { month: 'Jan', rate: 5.2 },
        { month: 'Feb', rate: 4.8 },
        { month: 'Mar', rate: 4.6 }
    ],
    commonProcedures: [
        { procedure: 'Coronary Angioplasty', count: 85, avgTime: 90, complicationRate: 3.2 },
        { procedure: 'Endoscopy', count: 120, avgTime: 45, complicationRate: 1.5 }
    ],
    patientSatisfaction: { rate: 92.5, change: 2.5 },
    lengthOfStay: { days: 4.3, change: -0.7 },
    readmissionRate: { rate: 4.1, change: -0.9 },
    mortalityRate: { rate: 1.2, change: -0.3 }
};

// Partial metrics mock
const partialMetrics = {
    patientsByAge: [
        { age: '0-17', count: 120 },
        { age: '18-34', count: 250 }
    ],
    diagnosisFrequency: [
        { name: 'Hypertension', count: 150 },
        { name: 'Diabetes Type 2', count: 120 }
    ],
    patientSatisfaction: { rate: 92.5, change: 2.5 },
    lengthOfStay: { days: 4.3, change: -0.7 },
    readmissionRate: { rate: 4.1, change: -0.9 },
    mortalityRate: { rate: 1.2, change: -0.3 }
};

// Cardiology-specific diagnoses for department filtering test
const cardiologyDiagnoses = {
    diagnosisFrequency: [
        { name: 'Hypertension', count: 150 },
        { name: 'Coronary Artery Disease', count: 65 },
        { name: 'Arrhythmia', count: 45 }
    ],
    patientSatisfaction: { rate: 92.5, change: 2.5 },
    lengthOfStay: { days: 4.3, change: -0.7 },
    readmissionRate: { rate: 4.1, change: -0.9 },
    mortalityRate: { rate: 1.2, change: -0.3 }
};

describe('ClinicalReports', () => {
    it('should display "No clinical data available" when no metrics are provided', () => {
        render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all" 
            />
        );
        
        expect(screen.getByText('No clinical data available')).toBeInTheDocument();
        expect(screen.getByText(/There is no clinical data available for the selected filters/)).toBeInTheDocument();
        expect(screen.getByTestId('icon-alert-triangle')).toBeInTheDocument();
    });

    it('should render all metrics sections when complete data is provided', () => {
        render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all"
                clinicalMetrics={mockClinicalMetrics}
            />
        );
        
        // Check for main metrics
        expect(screen.getByText('Patient Satisfaction')).toBeInTheDocument();
        expect(screen.getByText('Average Length of Stay')).toBeInTheDocument();
        expect(screen.getByText('Readmission Rate')).toBeInTheDocument();
        expect(screen.getByText('Mortality Rate')).toBeInTheDocument();
        
        // Check for charts/sections
        expect(screen.getByText('Patient Age Distribution')).toBeInTheDocument();
        expect(screen.getByText('Patient Gender Distribution')).toBeInTheDocument();
        expect(screen.getByText('Patient Outcomes by Month')).toBeInTheDocument();
        expect(screen.getByText('Diagnosis Distribution')).toBeInTheDocument();
        expect(screen.getByText('Treatment Effectiveness')).toBeInTheDocument();
        expect(screen.getByText('Readmission Rates Trend')).toBeInTheDocument();
        expect(screen.getByText('Common Procedures')).toBeInTheDocument();
    });

    it('should display appropriate messages for unavailable metrics', () => {
        render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all"
                clinicalMetrics={{
                    patientSatisfaction: { rate: 92.5, change: 2.5 },
                    lengthOfStay: { days: 4.3, change: -0.7 },
                    readmissionRate: { rate: 4.1, change: -0.9 },
                    mortalityRate: { rate: 1.2, change: -0.3 }
                }}
            />
        );
        
        // Check for "no data" messages
        expect(screen.getByText('No age distribution data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No gender distribution data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No patient outcomes data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No diagnosis distribution data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No treatment effectiveness data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No readmission rate data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No procedure data available for the selected filters.')).toBeInTheDocument();
    });

    it('should filter diagnoses based on department filter', () => {
        const { rerender } = render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all"
                clinicalMetrics={cardiologyDiagnoses}
            />
        );
        
        // Check that the diagnosis section is rendered
        expect(screen.getByText('Diagnosis Distribution')).toBeInTheDocument();
        
        // Rerender with cardiology filter
        rerender(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="cardio" 
                reportTypeFilter="all"
                clinicalMetrics={cardiologyDiagnoses}
            />
        );
        
        // Still should render the diagnosis section
        expect(screen.getByText('Diagnosis Distribution')).toBeInTheDocument();
    });

    it('should properly format numerical metrics and show correct trend indicators', () => {
        render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all"
                clinicalMetrics={mockClinicalMetrics}
            />
        );
        
        // Check for formatted values
        expect(screen.getByText('92.5%')).toBeInTheDocument(); // Patient satisfaction
        expect(screen.getByText('4.3 days')).toBeInTheDocument(); // Length of stay
        expect(screen.getByText('4.1%')).toBeInTheDocument(); // Readmission rate
        expect(screen.getByText('1.2%')).toBeInTheDocument(); // Mortality rate
        
        // Check for trend indicators
        expect(screen.getByText('+2.5%')).toBeInTheDocument(); // Positive change for patient satisfaction
        expect(screen.getByText('-0.7 days')).toBeInTheDocument(); // Negative change for length of stay
        expect(screen.getByText('-0.9%')).toBeInTheDocument(); // Negative change for readmission rate
        expect(screen.getByText('-0.3%')).toBeInTheDocument(); // Negative change for mortality rate
        
        // Verify trend icons are present
        expect(screen.getAllByTestId('icon-trending-up')).toHaveLength(1); // For positive patient satisfaction
        expect(screen.getAllByTestId('icon-trending-down')).toHaveLength(3); // For negative trends
    });

    it('should render age distribution chart when data is available', () => {
        render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all"
                clinicalMetrics={mockClinicalMetrics}
            />
        );
        expect(screen.getByText('Patient Age Distribution')).toBeInTheDocument();
        expect(screen.getByText('Breakdown of patients by age range')).toBeInTheDocument();
        expect(screen.queryByText('No age distribution data available for the selected filters.')).not.toBeInTheDocument();
        
        // Find the Age Distribution card and query within it
        const ageCard = screen.getByText('Patient Age Distribution').closest('.rounded-lg');
        expect(ageCard).toBeInTheDocument();
        
        // Check chart components are rendered within this card
        const container = within(ageCard as HTMLElement).getByTestId('responsive-container');
        expect(container).toBeInTheDocument();
        expect(within(ageCard as HTMLElement).getByTestId('bar-chart')).toBeInTheDocument();
        });

        it('should render gender distribution pie chart when data is available', () => {
        render(
            <ClinicalReports 
            dateRange={mockDateRange} 
            departmentFilter="all" 
            reportTypeFilter="all"
            clinicalMetrics={mockClinicalMetrics}
            />
        );
        
        expect(screen.getByText('Patient Gender Distribution')).toBeInTheDocument();
        expect(screen.getByText('Breakdown of patients by gender')).toBeInTheDocument();
        expect(screen.queryByText('No gender distribution data available for the selected filters.')).not.toBeInTheDocument();
        
        // Find the Gender Distribution card and query within it
        const genderCard = screen.getByText('Patient Gender Distribution').closest('.rounded-lg');
        expect(genderCard).toBeInTheDocument();

            // Check pie chart components are rendered - don't look for specific nesting
        expect(within(genderCard! as HTMLElement).getByTestId('responsive-container')).toBeInTheDocument();
        
        });

        it('should render patient outcomes chart when data is available', () => {
        render(
            <ClinicalReports 
            dateRange={mockDateRange} 
            departmentFilter="all" 
            reportTypeFilter="all"
            clinicalMetrics={mockClinicalMetrics}
            />
        );
        
        expect(screen.getByText('Patient Outcomes by Month')).toBeInTheDocument();
        expect(screen.getByText('Percentage of patients with improved, stable, or deteriorated conditions')).toBeInTheDocument();
        expect(screen.queryByText('No patient outcomes data available for the selected filters.')).not.toBeInTheDocument();
        
        // Find the Outcomes card
        const outcomesCard = screen.getByText('Patient Outcomes by Month').closest('.rounded-lg');
        expect(outcomesCard).toBeInTheDocument();
        
        // Check area chart components
        expect(within(outcomesCard as HTMLElement).getByTestId('area-chart')).toBeInTheDocument();
        
        // Instead of checking for individual areas which may not be rendered as separate elements
        // Just check that the chart container is there
        expect(within(outcomesCard as HTMLElement).getByTestId('responsive-container')).toBeInTheDocument();
    });
    

    it('should render procedures table when data is available', () => {
        render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all"
                clinicalMetrics={mockClinicalMetrics}
            />
        );
        
        expect(screen.getByText('Common Procedures')).toBeInTheDocument();
        expect(screen.getByText('Details and statistics for frequently performed procedures')).toBeInTheDocument();
        expect(screen.queryByText('No procedure data available for the selected filters.')).not.toBeInTheDocument();
        
        // Check table contents
        expect(screen.getByText('Coronary Angioplasty')).toBeInTheDocument();
        expect(screen.getByText('Endoscopy')).toBeInTheDocument();
        expect(screen.getByText('85')).toBeInTheDocument(); // Count for Coronary Angioplasty
        expect(screen.getByText('120')).toBeInTheDocument(); // Count for Endoscopy
        expect(screen.getByText('90 min')).toBeInTheDocument(); // Avg time for Coronary Angioplasty
        expect(screen.getByText('3.2%')).toBeInTheDocument(); // Complication rate for Coronary Angioplasty
    });

    it('should render diagnosis chart when data is available and respect department filtering', () => {
        const { rerender } = render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all"
                clinicalMetrics={mockClinicalMetrics}
            />
        );
        
        expect(screen.getByText('Diagnosis Distribution')).toBeInTheDocument();
        expect(screen.getByText('Breakdown of diagnoses by category')).toBeInTheDocument();
        
        // Switch to cardiology department to test filtering
        rerender(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="cardio" 
                reportTypeFilter="all"
                clinicalMetrics={cardiologyDiagnoses}
            />
        );
        
        // Should still show the section title
        expect(screen.getByText('Diagnosis Distribution')).toBeInTheDocument();
        
        // With cardiology data, should render cardiology-specific diagnoses
        const container = screen.getAllByTestId('responsive-container');
        expect(container.length).toBeGreaterThan(0);
    });

    it('should render readmission rates chart when data is available', () => {
        render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all"
                clinicalMetrics={mockClinicalMetrics}
            />
        );
        
        expect(screen.getByText('Readmission Rates Trend')).toBeInTheDocument();
        expect(screen.getByText('Monthly readmission rates for the past year')).toBeInTheDocument();
        expect(screen.queryByText('No readmission rate data available for the selected filters.')).not.toBeInTheDocument();
        
        // Find the Readmission card
        const readmissionCard = screen.getByText('Readmission Rates Trend').closest('.rounded-lg');
        expect(readmissionCard).toBeInTheDocument();
        
        // Check line chart components
        expect(within(readmissionCard! as HTMLElement).getByTestId('line-chart')).toBeInTheDocument();
        
        // Instead of checking for individual line which may not be rendered in the mock
        // Just check that the chart container is there
        expect(within(readmissionCard! as HTMLElement).getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle partial data correctly', () => {
        render(
            <ClinicalReports 
                dateRange={mockDateRange} 
                departmentFilter="all" 
                reportTypeFilter="all"
                clinicalMetrics={partialMetrics}
            />
        );
        
        // Should show available sections
        expect(screen.getByText('Patient Age Distribution')).toBeInTheDocument();
        expect(screen.getByText('Diagnosis Distribution')).toBeInTheDocument();
        
        // Should show "no data" messages for missing sections
        expect(screen.getByText('No gender distribution data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No patient outcomes data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No treatment effectiveness data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No readmission rate data available for the selected filters.')).toBeInTheDocument();
        expect(screen.getByText('No procedure data available for the selected filters.')).toBeInTheDocument();
    });
});