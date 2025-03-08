import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import {

Drawer,
DrawerTrigger,
DrawerContent,
DrawerOverlay,
DrawerHeader,
DrawerFooter,
DrawerTitle,
DrawerDescription,
} from '@/components/ui/drawer';

vi.mock('vaul', () => ({
  Drawer: {
    Root: ({ children, shouldScaleBackground, ...props }: any) => (
      <div
        data-testid="drawer-root"
        // Convert the boolean into a string for the DOM attribute
        shouldScaleBackground={String(shouldScaleBackground)}
        {...props}
      >
        {children}
      </div>
    ),
    Trigger: ({ children, ...props }: any) => (
      <button data-testid="drawer-trigger" {...props}>
        {children}
      </button>
    ),
    Portal: ({ children, ...props }: any) => (
      <div data-testid="drawer-portal" {...props}>
        {children}
      </div>
    ),
    Close: ({ children, ...props }: any) => (
      <button data-testid="drawer-close" {...props}>
        {children}
      </button>
    ),
    Overlay: React.forwardRef(({ className, ...props }: any, ref: any) => (
      <div data-testid="drawer-overlay" ref={ref} className={className} {...props} />
    )),
    Content: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
      <div data-testid="drawer-content" ref={ref} className={className} {...props}>
        {children}
      </div>
    )),
    Title: React.forwardRef(({ className, ...props }: any, ref: any) => (
      <h2 data-testid="drawer-title" ref={ref} className={className} {...props} />
    )),
    Description: React.forwardRef(({ className, ...props }: any, ref: any) => (
      <p data-testid="drawer-description" ref={ref} className={className} {...props} />
    )),
  },
}));

describe('Drawer', () => {
it('renders the Drawer root with correct props', () => {
    render(<Drawer shouldScaleBackground={false} data-testid="test-drawer" />);
    const drawer = screen.getByTestId('test-drawer');
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveAttribute('shouldScaleBackground', 'false');
});

it('renders DrawerContent with children and applies className', () => {
    render(
        <DrawerContent className="test-class">
            <span>Test content</span>
        </DrawerContent>
    );
    const content = screen.getByTestId('drawer-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('test-class');
    expect(content).toHaveTextContent('Test content');
});

it('renders DrawerOverlay with className', () => {
    render(<DrawerOverlay className="test-overlay" />);
    const overlay = screen.getByTestId('drawer-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('test-overlay');
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-black/80');
});

it('renders DrawerHeader with correct classes', () => {
    render(<DrawerHeader data-testid="header">Header</DrawerHeader>);
    const header = screen.getByTestId('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('grid', 'gap-1.5', 'p-4');
    expect(header).toHaveTextContent('Header');
});

it('renders DrawerFooter with correct classes', () => {
    render(<DrawerFooter data-testid="footer">Footer</DrawerFooter>);
    const footer = screen.getByTestId('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('mt-auto', 'flex', 'flex-col', 'gap-2', 'p-4');
    expect(footer).toHaveTextContent('Footer');
});

it('renders DrawerTitle with correct classes', () => {
    render(<DrawerTitle>Title</DrawerTitle>);
    const title = screen.getByTestId('drawer-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-lg', 'font-semibold');
});

it('renders DrawerDescription with correct classes', () => {
    render(<DrawerDescription>Description</DrawerDescription>);
    const description = screen.getByTestId('drawer-description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
});
});