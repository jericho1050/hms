import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, buttonVariants } from '@/components/ui/button';
import * as React from 'react';
import { cn } from "@/lib/utils";


describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('applies default variant and size', () => {
        render(<Button>Default Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-primary');
        expect(button).toHaveClass('h-10');
    });

    it('applies different variants correctly', () => {
        const { rerender } = render(<Button variant="destructive">Destructive</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-destructive');

        rerender(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button')).toHaveClass('border-input');

        rerender(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-secondary');

        rerender(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');

        rerender(<Button variant="link">Link</Button>);
        expect(screen.getByRole('button')).toHaveClass('text-primary');
    });

    it('applies different sizes correctly', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-9');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-11');

        rerender(<Button size="icon">Icon</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-10 w-10');
    });

    it('uses Slot component when asChild is true', () => {
        render(<Button asChild>Child Component</Button>);
        expect(screen.getByTestId('slot')).toBeInTheDocument();
    });

    it('passes custom className to the component', () => {
        render(<Button className="custom-class">Custom Class</Button>);
        expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
        const ref = React.createRef<HTMLButtonElement>();
        render(<Button ref={ref}>Ref Button</Button>);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('forwards additional props to the button element', () => {
        render(<Button data-testid="test-button" aria-label="Test">Test Props</Button>);
        const button = screen.getByTestId('test-button');
        expect(button).toHaveAttribute('aria-label', 'Test');
    });

    it('has correct displayName', () => {
        expect(Button.displayName).toBe('Button');
    });

    it('applies buttonVariants correctly', () => {
        const className = buttonVariants({ variant: 'destructive', size: 'sm' });
        expect(className).toContain('bg-destructive');
        expect(className).toContain('h-9');
    });
});