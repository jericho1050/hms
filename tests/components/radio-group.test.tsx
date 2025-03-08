import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';

describe('RadioGroup', () => {
    it('renders correctly', () => {
        render(
            <RadioGroup>
                <RadioGroupItem value="option1" />
                <RadioGroupItem value="option2" />
            </RadioGroup>
        );
        
        expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('applies custom className', () => {
        const { container } = render(
            <RadioGroup className="test-class">
                <RadioGroupItem value="option1" />
            </RadioGroup>
        );
        
        expect(container.firstChild).toHaveClass('test-class');
        expect(container.firstChild).toHaveClass('grid');
        expect(container.firstChild).toHaveClass('gap-2');
    });

    it('handles value selection', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        
        render(
            <RadioGroup defaultValue="option1" onValueChange={onChange}>
                <div>
                    <label htmlFor="option1">Option 1</label>
                    <RadioGroupItem id="option1" value="option1" />
                </div>
                <div>
                    <label htmlFor="option2">Option 2</label>
                    <RadioGroupItem id="option2" value="option2" />
                </div>
            </RadioGroup>
        );
        
        const option1 = screen.getByLabelText('Option 1');
        const option2 = screen.getByLabelText('Option 2');
        
        expect(option1).toBeChecked();
        expect(option2).not.toBeChecked();
        
        await user.click(option2);
        expect(onChange).toHaveBeenCalledWith('option2');
    });
});

describe('RadioGroupItem', () => {
    it('renders with correct classes', () => {
        render(
            <RadioGroup>
                <RadioGroupItem value="test" />
            </RadioGroup>
        );
        
        const radio = screen.getByRole('radio');
        expect(radio).toHaveClass('aspect-square');
        expect(radio).toHaveClass('h-4');
        expect(radio).toHaveClass('w-4');
        expect(radio).toHaveClass('rounded-full');
        expect(radio).toHaveClass('border-primary');
    });

    it('applies custom className', () => {
        render(
            <RadioGroup>
                <RadioGroupItem value="test" className="item-test-class" />
            </RadioGroup>
        );
        
        expect(screen.getByRole('radio')).toHaveClass('item-test-class');
    });

    it('can be disabled', () => {
        render(
            <RadioGroup>
                <RadioGroupItem value="test" disabled />
            </RadioGroup>
        );
        
        expect(screen.getByRole('radio')).toBeDisabled();
    });
});