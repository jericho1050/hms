import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, badgeVariants } from '@/components/ui/badge';

describe('Badge', () => {
    it('renders children correctly', () => {
        render(<Badge>Test Badge</Badge>);
        expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('applies default variant styles', () => {
        render(<Badge>Default Badge</Badge>);
        const badge = screen.getByText('Default Badge');
        expect(badge.className).toContain('bg-primary');
        expect(badge.className).toContain('text-primary-foreground');
    });

    it('applies secondary variant styles when specified', () => {
        render(<Badge variant="secondary">Secondary Badge</Badge>);
        const badge = screen.getByText('Secondary Badge');
        expect(badge.className).toContain('bg-secondary');
        expect(badge.className).toContain('text-secondary-foreground');
    });

    it('applies destructive variant styles when specified', () => {
        render(<Badge variant="destructive">Destructive Badge</Badge>);
        const badge = screen.getByText('Destructive Badge');
        expect(badge.className).toContain('bg-destructive');
        expect(badge.className).toContain('text-destructive-foreground');
    });

    it('applies outline variant styles when specified', () => {
        render(<Badge variant="outline">Outline Badge</Badge>);
        const badge = screen.getByText('Outline Badge');
        expect(badge.className).toContain('text-foreground');
    });

    it('combines custom className with variant styles', () => {
        render(<Badge className="custom-class">Badge with Custom Class</Badge>);
        const badge = screen.getByText('Badge with Custom Class');
        expect(badge.className).toContain('custom-class');
        // Still includes default variant styles
        expect(badge.className).toContain('bg-primary');
    });

    it('passes other HTML attributes to the div element', () => {
        render(<Badge data-testid="test-badge" aria-label="badge label">Badge with Props</Badge>);
        const badge = screen.getByTestId('test-badge');
        expect(badge).toHaveAttribute('aria-label', 'badge label');
    });
    
    it('exports badgeVariants for reuse', () => {
        expect(typeof badgeVariants).toBe('function');
        const classes = badgeVariants({ variant: 'destructive' });
        expect(classes).toContain('bg-destructive');
    });
});