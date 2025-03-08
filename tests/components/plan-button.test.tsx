import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlanButton } from '@/components/ui/plan-button';

describe('PlanButton', () => {
    it('renders children correctly', () => {
        render(<PlanButton>Test Button</PlanButton>);
        expect(screen.getByText('Test Button')).toBeTruthy();
    });

    it('applies active styles when active prop is true', () => {
        const { container } = render(<PlanButton active>Test Button</PlanButton>);
        const button = container.firstChild as HTMLElement;
        expect(button.className).toContain('bg-background');
        expect(button.className).toContain('text-foreground');
        expect(button.className).toContain('shadow-sm');
    });

    it('applies inactive styles when active prop is false', () => {
        const { container } = render(<PlanButton active={false}>Test Button</PlanButton>);
        const button = container.firstChild as HTMLElement;
        expect(button.className).toContain('text-muted-foreground');
        expect(button.className).not.toContain('bg-background');
    });

    it('applies inactive styles when active prop is not provided', () => {
        const { container } = render(<PlanButton>Test Button</PlanButton>);
        const button = container.firstChild as HTMLElement;
        expect(button.className).toContain('text-muted-foreground');
        expect(button.className).not.toContain('bg-background');
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(<PlanButton onClick={handleClick}>Test Button</PlanButton>);
        fireEvent.click(screen.getByText('Test Button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});