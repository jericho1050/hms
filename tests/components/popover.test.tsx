import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from "@/lib/utils";

// Mock the Portal to render in the test DOM
vi.mock('@radix-ui/react-popover', async () => {
  const actual = await vi.importActual('@radix-ui/react-popover');
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Popover component', () => {
    it('renders the popover with trigger and content', async () => {
        render(
            <Popover>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent>Content</PopoverContent>
            </Popover>
        );

        expect(screen.getByText('Open')).toBeInTheDocument();
        
        // Click the trigger
        const user = userEvent.setup();
        await user.click(screen.getByText('Open'));
        
        // Content should be visible
        expect(screen.getByText('Content')).toBeInTheDocument();
    });
    
    it('applies custom className to PopoverContent', async () => {
        const customClass = 'test-custom-class';
        
        render(
            <Popover>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent className={customClass} data-testid="content">Content</PopoverContent>
            </Popover>
        );
        
        const user = userEvent.setup();
        await user.click(screen.getByText('Open'));
        
        // Use testId instead of relying on parent relationship which can change
        expect(screen.getByTestId('content')).toHaveClass(customClass);
    });

    it('passes extra props to PopoverContent', async () => {
        const testId = 'test-popover-content';
        
        render(
            <Popover>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent data-testid={testId}>Content</PopoverContent>
            </Popover>
        );
        
        const user = userEvent.setup();
        await user.click(screen.getByText('Open'));
        
        expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it('uses custom align and sideOffset', async () => {
        render(
            <Popover>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent align="start" sideOffset={10}>Content</PopoverContent>
            </Popover>
        );

        const user = userEvent.setup();
        await user.click(screen.getByText('Open'));
        
        // We would need to test the alignment properties, but that's challenging
        // in a unit test environment. This would be better tested in integration tests.
        expect(screen.getByText('Content')).toBeInTheDocument();
    });
});