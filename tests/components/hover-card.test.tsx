import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

// Mock Radix UI components
vi.mock('@radix-ui/react-hover-card', () => {
    return {
        Root: ({ children }: { children: React.ReactNode }) => <div data-testid="hover-card-root">{children}</div>,
        Trigger: ({ children }: { children: React.ReactNode }) => <div data-testid="hover-card-trigger">{children}</div>,
        Content: vi.fn().mockImplementation(({ children, className, align, sideOffset, ...props }: any) => (
            <div 
                data-testid="hover-card-content" 
                data-align={align} 
                data-side-offset={sideOffset}
                className={className} 
                {...props}
            >
                {children}
            </div>
        )),
    };
});

describe('HoverCard', () => {
    it('renders HoverCard components correctly', () => {
        render(
            <HoverCard>
                <HoverCardTrigger>Hover me</HoverCardTrigger>
                <HoverCardContent>Hover content</HoverCardContent>
            </HoverCard>
        );
        
        expect(screen.getByTestId('hover-card-root')).toBeInTheDocument();
        expect(screen.getByTestId('hover-card-trigger')).toBeInTheDocument();
        expect(screen.getByText('Hover me')).toBeInTheDocument();
        expect(screen.getByTestId('hover-card-content')).toBeInTheDocument();
        expect(screen.getByText('Hover content')).toBeInTheDocument();
    });

    it('applies custom className to HoverCardContent', () => {
        render(
            <HoverCard>
                <HoverCardTrigger>Hover me</HoverCardTrigger>
                <HoverCardContent className="custom-class">Content</HoverCardContent>
            </HoverCard>
        );
        
        const content = screen.getByTestId('hover-card-content');
        expect(content.className).toContain('custom-class');
        expect(content.className).toContain('z-50');
        expect(content.className).toContain('rounded-md');
    });

    it('applies default align and sideOffset values', () => {
        render(
            <HoverCard>
                <HoverCardTrigger>Hover me</HoverCardTrigger>
                <HoverCardContent>Content</HoverCardContent>
            </HoverCard>
        );
        
        const content = screen.getByTestId('hover-card-content');
        expect(content.getAttribute('data-align')).toBe('center');
        expect(content.getAttribute('data-side-offset')).toBe('4');
    });

    it('applies custom align and sideOffset values', () => {
        render(
            <HoverCard>
                <HoverCardTrigger>Hover me</HoverCardTrigger>
                <HoverCardContent align="start" sideOffset={10}>Content</HoverCardContent>
            </HoverCard>
        );
        
        const content = screen.getByTestId('hover-card-content');
        expect(content.getAttribute('data-align')).toBe('start');
        expect(content.getAttribute('data-side-offset')).toBe('10');
    });
});