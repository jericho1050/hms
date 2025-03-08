import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import {

ChartContainer,
ChartTooltip,
ChartTooltipContent,
ChartLegend,
ChartLegendContent,
ChartStyle
} from '@/components/ui/chart';

// Mock recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="recharts-responsive-container">{children}</div>
    ),
    Tooltip: vi.fn(() => <div data-testid="recharts-tooltip" />),
    Legend: vi.fn(() => <div data-testid="recharts-legend" />)
    }));
    
    // Mock the types
    vi.mock('@/types/chart', () => ({
    THEMES: {
        light: '.light',
        dark: '.dark'
    },
    }));
    
// Sample chart config for testing
const mockChartConfig = {
data1: {
    // Remove color property as ChartConfig allows either color OR theme but not both
    label: 'Data 1',
    theme: {
        light: '#ff0000',
        dark: '#990000'
    }
},
data2: {
    color: '#00ff00',
    label: 'Data 2'
}
};

describe('Chart Components', () => {
describe('ChartContainer', () => {
    it('renders with children and config', () => {
        render(
            <ChartContainer config={mockChartConfig}>
                <div data-testid="chart-child">Chart Content</div>
            </ChartContainer>
        );

        expect(screen.getByTestId('recharts-responsive-container')).toBeInTheDocument();
        expect(screen.getByTestId('chart-child')).toBeInTheDocument();
        expect(screen.getByTestId('chart-child')).toHaveTextContent('Chart Content');
    });

    it('applies custom className', () => {
        const { container } = render(
            <ChartContainer config={mockChartConfig} className="test-class">
                <div>Chart Content</div>
            </ChartContainer>
        );
        
        const chartElement = container.firstChild as HTMLElement;
        expect(chartElement.className).toContain('test-class');
    });

    it('generates a data-chart attribute with id', () => {
        const { container } = render(
            <ChartContainer id="test-id" config={mockChartConfig}>
                <div>Chart Content</div>
            </ChartContainer>
        );
        
        const chartElement = container.firstChild as HTMLElement;
        expect(chartElement.getAttribute('data-chart')).toBe('chart-test-id');
    });
});

describe('ChartStyle', () => {
    it('renders a style element when config has themes or colors', () => {
        const { container } = render(
            <ChartStyle id="test-chart" config={mockChartConfig} />
        );
        
        expect(container.querySelector('style')).not.toBeNull();
    });

    it('does not render a style element when config has no themes or colors', () => {
        const { container } = render(
            <ChartStyle id="test-chart" config={{}} />
        );
        
        expect(container.querySelector('style')).toBeNull();
    });
});

describe('Components with ChartContext', () => {
    describe('ChartTooltipContent', () => {
        const mockPayload = [
            {
                name: 'Data 1',
                value: 100,
                dataKey: 'data1',
                color: '#ff0000',
                payload: { fill: '#ff0000' }
            }
        ];

        it('renders nothing when not active', () => {
            const { container } = render(
                <ChartContainer config={mockChartConfig}>
                    <ChartTooltipContent active={false} payload={mockPayload} />
                </ChartContainer>
            );
            
            expect(container.textContent).not.toContain('Data 1');
        });

        it('renders tooltip content when active with payload', () => {
            render(
              <ChartContainer config={mockChartConfig}>
                <ChartTooltipContent active={true} payload={mockPayload} />
              </ChartContainer>
            );
          
            // Expect "Data 1" to appear at least once
            const dataElements = screen.getAllByText('Data 1');
            expect(dataElements.length).toBeGreaterThan(0);
          
            expect(screen.getByText('100')).toBeInTheDocument();
          });
          
          it('hides indicator when specified', () => {
            render(
              <ChartContainer config={mockChartConfig}>
                <ChartTooltipContent
                  active={true}
                  payload={mockPayload}
                  hideIndicator={true}
                />
              </ChartContainer>
            );
          
            // Again, accept multiple matches for "Data 1" 
            const dataElements = screen.getAllByText('Data 1');
            expect(dataElements.length).toBeGreaterThan(0);
          
            // Check that the indicator is hidden
            // (the small colored box shouldn't exist)
            const tooltip = screen.getAllByText('Data 1')[0].closest('.grid');
            expect(tooltip?.querySelector('.rounded-\\[2px\\]')).toBeNull();
          });

        it('uses custom formatter when provided', () => {
            const customFormatter = vi.fn(() => <span>Custom Format</span>);
            
            render(
                <ChartContainer config={mockChartConfig}>
                    <ChartTooltipContent 
                        active={true} 
                        payload={mockPayload} 
                        formatter={customFormatter}
                    />
                </ChartContainer>
            );
            
            expect(customFormatter).toHaveBeenCalled();
            expect(screen.getByText('Custom Format')).toBeInTheDocument();
        });

        it('hides indicator when specified', () => {
            render(
              <ChartContainer config={mockChartConfig}>
                <ChartTooltipContent
                  active={true}
                  payload={mockPayload}
                  hideIndicator={true}
                />
              </ChartContainer>
            );
          
            // Again, accept multiple matches for "Data 1" 
            const dataElements = screen.getAllByText('Data 1');
            expect(dataElements.length).toBeGreaterThan(0);
          
            // Check that the indicator is hidden
            // (the small colored box shouldn't exist)
            const tooltip = screen.getAllByText('Data 1')[0].closest('.grid');
            expect(tooltip?.querySelector('.rounded-\\[2px\\]')).toBeNull();
          });
    });

    describe('ChartLegendContent', () => {
        const mockPayload = [
            { value: 'data1', dataKey: 'data1', color: '#ff0000' },
            { value: 'data2', dataKey: 'data2', color: '#00ff00' }
        ];

        it('renders nothing with empty payload', () => {
            const { container } = render(
                <ChartContainer config={mockChartConfig}>
                    <ChartLegendContent payload={[]} />
                </ChartContainer>
            );
            
            expect(container.textContent).not.toContain('Data 1');
        });

        it('renders legend items for each payload item', () => {
            render(
                <ChartContainer config={mockChartConfig}>
                    <ChartLegendContent payload={mockPayload} />
                </ChartContainer>
            );
            
            expect(screen.getByText('Data 1')).toBeInTheDocument();
            expect(screen.getByText('Data 2')).toBeInTheDocument();
        });

        it('applies verticalAlign classes correctly', () => {
            render(
              <ChartContainer config={mockChartConfig}>
                <ChartLegendContent payload={mockPayload} verticalAlign="top" />
              </ChartContainer>
            );
          
            // Find the line containing "Data 1"
            const dataItem = screen.getByText('Data 1');
            // Go up two levels to reach the outer container with "pb-3"
            const legend = dataItem.closest('.flex.items-center.gap-4');
            
            expect(legend).toHaveClass('pb-3');
            expect(legend).not.toHaveClass('pt-3');
          });
    });
});

describe('Error handling', () => {
    it('throws an error when ChartTooltipContent is used outside of ChartContainer', () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error');
        consoleSpy.mockImplementation(() => {});
        
        expect(() => {
            render(<ChartTooltipContent active={true} payload={[]} />);
        }).toThrow('useChart must be used within a <ChartContainer />');
        
        consoleSpy.mockRestore();
    });
});
});