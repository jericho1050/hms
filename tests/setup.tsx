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


