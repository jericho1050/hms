import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Separator } from '../../components/ui/separator';
import { createRef } from 'react';

describe('Separator', () => {
    it('renders without crashing', () => {
        const { container } = render(<Separator />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('applies the correct classes for horizontal orientation by default', () => {
        const { container } = render(<Separator />);
        const separator = container.firstChild as HTMLElement;
        expect(separator).toHaveClass('h-[1px]');
        expect(separator).toHaveClass('w-full');
        expect(separator).toHaveClass('bg-border');
    });

    it('applies the correct classes for vertical orientation', () => {
        const { container } = render(<Separator orientation="vertical" />);
        const separator = container.firstChild as HTMLElement;
        expect(separator).toHaveClass('h-full');
        expect(separator).toHaveClass('w-[1px]');
    });

    it('applies custom className', () => {
        const { container } = render(<Separator className="test-class" />);
        const separator = container.firstChild as HTMLElement;
        expect(separator).toHaveClass('test-class');
    });

    it('sets decorative attribute by default', () => {
        const { container } = render(<Separator />);
        const separator = container.firstChild as HTMLElement;
        expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('forwards ref to the underlying element', () => {
        const ref = createRef<HTMLDivElement>();
        render(<Separator ref={ref} />);
        expect(ref.current).not.toBeNull();
    });

    it('forwards additional props', () => {
        const { container } = render(<Separator data-testid="test-separator" />);
        const separator = container.firstChild as HTMLElement;
        expect(separator).toHaveAttribute('data-testid', 'test-separator');
    });
});