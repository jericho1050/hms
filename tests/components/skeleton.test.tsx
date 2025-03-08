import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from '../../components/ui/skeleton';

describe('Skeleton', () => {
    it('renders correctly', () => {
        const { container } = render(<Skeleton />);
        expect(container.firstChild).toHaveClass('animate-pulse rounded-md bg-muted');
    });

    it('combines classNames correctly', () => {
        const { container } = render(<Skeleton className="test-class" />);
        expect(container.firstChild).toHaveClass('animate-pulse rounded-md bg-muted test-class');
    });

    it('passes through other props correctly', () => {
        const testId = 'test-id';
        render(<Skeleton data-testid={testId} />);
        const element = document.querySelector(`[data-testid="${testId}"]`);
        expect(element).not.toBeNull();
    });
});