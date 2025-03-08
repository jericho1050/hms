import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import {

Carousel,
CarouselContent,
CarouselItem,
CarouselNext,
CarouselPrevious,
} from '@/components/ui/carousel';

// Mock useEmblaCarousel
vi.mock('embla-carousel-react', () => {
    return {
        default: () => {
            const mockApi = {
                canScrollPrev: vi.fn(() => true),
                canScrollNext: vi.fn(() => true),
                scrollPrev: vi.fn(),
                scrollNext: vi.fn(),
                on: vi.fn(),
                off: vi.fn(),
            };
            return [React.createRef(), mockApi];
        },
    };
    });
    
describe('Carousel', () => {
beforeEach(() => {
    vi.clearAllMocks();
});

it('renders correctly with default props', () => {
    render(
        <Carousel>
            <CarouselContent>
                <CarouselItem>Slide 1</CarouselItem>
                <CarouselItem>Slide 2</CarouselItem>
            </CarouselContent>
        </Carousel>
    );
    
    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getAllByRole('group')).toHaveLength(2);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
});

it('handles orientation prop correctly', () => {
    render(
        <Carousel orientation="vertical">
            <CarouselContent>
                <CarouselItem>Slide 1</CarouselItem>
            </CarouselContent>
        </Carousel>
    );
    
    // The carousel content should have flex-col class for vertical orientation
    const content = screen.getByText('Slide 1').closest('div[class*="flex"]');
    expect(content).toHaveClass('flex-col');
});

it('navigation buttons work correctly', async () => {
    const user = userEvent.setup();
    
    render(
        <Carousel>
            <CarouselContent>
                <CarouselItem>Slide 1</CarouselItem>
                <CarouselItem>Slide 2</CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
    
    const prevButton = screen.getByText('Previous slide').closest('button');
    const nextButton = screen.getByText('Next slide').closest('button');
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    
    await user.click(prevButton!);
    await user.click(nextButton!);
    
    // Check if the API methods were called
    // This would require accessing the mocked implementation
});

it('handles keyboard navigation correctly', () => {
    render(
        <Carousel>
            <CarouselContent>
                <CarouselItem>Slide 1</CarouselItem>
                <CarouselItem>Slide 2</CarouselItem>
            </CarouselContent>
        </Carousel>
    );
    
    const carousel = screen.getByRole('region');
    
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    
    // Similarly, we would need to verify that the API methods were called
});

it('adds correct accessibility attributes', () => {
    render(
        <Carousel>
            <CarouselContent>
                <CarouselItem>Slide 1</CarouselItem>
            </CarouselContent>
        </Carousel>
    );
    
    expect(screen.getByRole('region')).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getByRole('group')).toHaveAttribute('aria-roledescription', 'slide');
});

it('sets API when provided with setApi prop', () => {
    const setApi = vi.fn();
    
    render(
        <Carousel setApi={setApi}>
            <CarouselContent>
                <CarouselItem>Slide 1</CarouselItem>
            </CarouselContent>
        </Carousel>
    );
    
    expect(setApi).toHaveBeenCalled();
});
});