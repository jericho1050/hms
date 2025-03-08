import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Slider } from '../../components/ui/slider';
import * as SliderPrimitive from "@radix-ui/react-slider";

describe('Slider', () => {
    it('renders without crashing', () => {
        const { container } = render(<Slider />);
        expect(container.firstChild).toBeTruthy();
    });

    it('applies custom className to root element', () => {
        const { container } = render(<Slider className="test-custom-class" />);
        expect(container.firstChild).toHaveClass('test-custom-class');
        expect(container.firstChild).toHaveClass('relative');
        expect(container.firstChild).toHaveClass('flex');
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('passes props to the root element', () => {
        const { container } = render(
            <Slider aria-label="Volume" defaultValue={[50]} />
        );
        const rootElement = container.firstChild;
        expect(rootElement).toHaveAttribute('aria-label', 'Volume');
    });

    it('contains track, range and thumb elements', () => {
        const { container } = render(<Slider />);
        const track = container.querySelector('.relative.h-2.w-full.grow');
        expect(track).toBeTruthy();
        expect(track?.querySelector('.absolute.h-full.bg-primary')).toBeTruthy();
        expect(container.querySelector('.block.h-5.w-5.rounded-full')).toBeTruthy();
    });

    it('has the correct display name', () => {
        expect(Slider.displayName).toBe(SliderPrimitive.Root.displayName);
    });
});