import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


// Mock successful image loading
// Better mock for image loading with Radix UI components
beforeAll(() => {
    // Create a more robust image mock that works with Radix UI
    const originalImage = global.Image;
    // @ts-ignore - mocking Image constructor
    global.Image = class extends originalImage {
      constructor() {
        super();
        setTimeout(() => {
          // Trigger load event to simulate successful image loading
          if (this.onload) this.onload(new Event('load'));
        });
      }
    };
  });
  
  
describe('Avatar Component', () => {
    it('renders Avatar correctly', () => {
        render(<Avatar data-testid="avatar" />);
        expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('applies custom className to Avatar', () => {
        render(<Avatar data-testid="avatar" className="custom-class" />);
        expect(screen.getByTestId('avatar')).toHaveClass('custom-class');
    });

    it('renders AvatarImage correctly', async () => {
        render(
            <Avatar>
                <AvatarImage data-testid="avatar-image" src="test.jpg" alt="test" />
            </Avatar>
        );
        // Wait for the image to "load"
        await waitFor(() => {
            expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
        });
    });

    it('applies custom className to AvatarImage', async () => {
        render(
            <Avatar>
                <AvatarImage data-testid="avatar-image" className="custom-image" src="test.jpg" alt="test" />
            </Avatar>
        );
        // Wait for the image to "load"
        await waitFor(() => {
            expect(screen.getByTestId('avatar-image')).toHaveClass('custom-image');
        });
    });

    it('renders AvatarFallback correctly', () => {
        render(
            <Avatar>
                <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
            </Avatar>
        );
        expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
        expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JD');
    });

    it('applies custom className to AvatarFallback', () => {
        render(
            <Avatar>
                <AvatarFallback data-testid="avatar-fallback" className="custom-fallback">JD</AvatarFallback>
            </Avatar>
        );
        expect(screen.getByTestId('avatar-fallback')).toHaveClass('custom-fallback');
    });

    it('creates a complete Avatar with image and fallback', async () => {
        render(
            <Avatar data-testid="complete-avatar">
                <AvatarImage data-testid="complete-image" src="test.jpg" alt="test" />
                <AvatarFallback data-testid="complete-fallback">JD</AvatarFallback>
            </Avatar>
        );
        expect(screen.getByTestId('complete-avatar')).toBeInTheDocument();
        // Wait for the image to "load"
        await waitFor(() => {
            expect(screen.getByTestId('complete-image')).toBeInTheDocument();
        });
        // The fallback won't be visible when image loads successfully
    });
});