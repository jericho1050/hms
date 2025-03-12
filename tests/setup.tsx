import '@testing-library/jest-dom';
import { vi } from 'vitest';
vi.mock("@radix-ui/react-slot", () => ({
    Slot: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) => (
        <div data-testid="slot" {...props}>{children}</div>
    ),
}));

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};


// Add matchMedia mock for all tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(), // Deprecated but might be used by some libraries
    removeListener: vi.fn(), // Deprecated but might be used by some libraries
    dispatchEvent: vi.fn(),
  })),
});

// Set a default innerWidth to avoid undefined issues
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024, // Default to desktop size
});