import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';
import * as React from 'react';

describe('Input component', () => {
    it('renders correctly', () => {
        render(<Input data-testid="test-input" />);
        expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });

    it('passes through props correctly', () => {
        render(<Input data-testid="test-input" placeholder="Enter text" />);
        expect(screen.getByTestId('test-input')).toHaveAttribute('placeholder', 'Enter text');
    });

    it('applies the default className', () => {
        render(<Input data-testid="test-input" />);
        const input = screen.getByTestId('test-input');
        expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border');
    });

    it('merges the default className with provided className', () => {
        render(<Input data-testid="test-input" className="custom-class" />);
        const input = screen.getByTestId('test-input');
        expect(input).toHaveClass('custom-class');
        expect(input).toHaveClass('flex', 'h-10', 'w-full');
    });

    it('applies the correct type', () => {
        render(<Input data-testid="test-input" type="password" />);
        expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'password');
    });

    it('forwards the ref correctly', () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<Input ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('handles user input correctly', async () => {
        const user = userEvent.setup();
        render(<Input data-testid="test-input" />);
        const input = screen.getByTestId('test-input');
        
        await user.type(input, 'Hello, world!');
        expect(input).toHaveValue('Hello, world!');
    });

    it('applies disabled styles when disabled', () => {
        render(<Input data-testid="test-input" disabled />);
        const input = screen.getByTestId('test-input');
        expect(input).toBeDisabled();
        expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
});