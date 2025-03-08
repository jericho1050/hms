import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

// Mock the radix UI components
vi.mock('@radix-ui/react-scroll-area', () => {
    return {
        Root: ({ children, className, ...props }: any) => (
            <div data-testid="scroll-area-root" className={className} {...props}>
                {children}
            </div>
        ),
        Viewport: ({ children, className }: any) => (
            <div data-testid="scroll-area-viewport" className={className}>
                {children}
            </div>
        ),
        ScrollAreaScrollbar: ({ children, className, orientation, ...props }: any) => (
            <div 
                data-testid="scroll-area-scrollbar" 
                data-orientation={orientation} 
                className={className} 
                {...props}
            >
                {children}
            </div>
        ),
        ScrollAreaThumb: ({ className }: any) => (
            <div data-testid="scroll-area-thumb" className={className}></div>
        ),
        Corner: () => <div data-testid="scroll-area-corner"></div>,
    };
});

// Mock cn utility
vi.mock('@/lib/utils', () => ({
    cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

describe('ScrollArea', () => {
    it('renders children correctly', () => {
        render(
            <ScrollArea>
                <div data-testid="child-content">Test Content</div>
            </ScrollArea>
        );
        
        expect(screen.getByTestId('child-content')).toHaveTextContent('Test Content');
    });

    it('applies custom className', () => {
        render(<ScrollArea className="custom-class" />);
        
        expect(screen.getByTestId('scroll-area-root')).toHaveClass('custom-class');
    });

    it('forwards props to the root component', () => {
        render(<ScrollArea data-custom="test-value" />);
        
        expect(screen.getByTestId('scroll-area-root')).toHaveAttribute('data-custom', 'test-value');
    });

    it('includes viewport, scrollbar and corner', () => {
        render(<ScrollArea />);
        
        expect(screen.getByTestId('scroll-area-viewport')).toBeInTheDocument();
        expect(screen.getByTestId('scroll-area-scrollbar')).toBeInTheDocument();
        expect(screen.getByTestId('scroll-area-corner')).toBeInTheDocument();
    });
});

describe('ScrollBar', () => {
    it('renders with vertical orientation by default', () => {
        render(<ScrollBar />);
        
        expect(screen.getByTestId('scroll-area-scrollbar')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('applies custom className', () => {
        render(<ScrollBar className="custom-scrollbar" />);
        
        expect(screen.getByTestId('scroll-area-scrollbar')).toHaveClass('custom-scrollbar');
    });

    it('renders with horizontal orientation when specified', () => {
        render(<ScrollBar orientation="horizontal" />);
        
        expect(screen.getByTestId('scroll-area-scrollbar')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('forwards props to the scrollbar component', () => {
        render(<ScrollBar data-custom="scrollbar-prop" />);
        
        expect(screen.getByTestId('scroll-area-scrollbar')).toHaveAttribute('data-custom', 'scrollbar-prop');
    });

    it('includes a thumb element', () => {
        render(<ScrollBar />);
        
        expect(screen.getByTestId('scroll-area-thumb')).toBeInTheDocument();
    });
});