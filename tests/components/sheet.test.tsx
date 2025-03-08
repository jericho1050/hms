import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

// Mock modules
vi.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock SheetPrimitive.Content
vi.mock('@radix-ui/react-dialog', async () => {
  return {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="portal">{children}</div>,
    Overlay: React.forwardRef(({ className, ...props }: any, ref: any) => (
      <div data-testid="overlay" className={className} {...props} ref={ref} />
    )),
    Content: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
      <div data-testid="content" className={className} {...props} ref={ref}>
        {children}
      </div>
    )),
    Close: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    Title: React.forwardRef(({ className, ...props }: any, ref: any) => (
      <h2 data-testid="dialog-title" className={className} {...props} ref={ref} />
    )),
    Description: React.forwardRef(({ className, ...props }: any, ref: any) => (
      <p data-testid="dialog-desc" className={className} {...props} ref={ref} />
    )),
  };
});

// Mock the types to avoid circular references
vi.mock('@/types/sheet', () => ({
  SheetContentProps: {}
}));

describe('Sheet component', () => {
  describe('SheetHeader', () => {
    it('renders with default classes', () => {
      render(<SheetHeader data-testid="header">Header Content</SheetHeader>);
      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(header.className).toContain('flex flex-col space-y-2 text-center sm:text-left');
    });

    it('applies custom className', () => {
      render(<SheetHeader className="custom-header" data-testid="header">Header Content</SheetHeader>);
      expect(screen.getByTestId('header').className).toContain('custom-header');
    });
  });

  describe('SheetFooter', () => {
    it('renders with default classes', () => {
      render(<SheetFooter data-testid="footer">Footer Content</SheetFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer.className).toContain('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2');
    });

    it('applies custom className', () => {
      render(<SheetFooter className="custom-footer" data-testid="footer">Footer Content</SheetFooter>);
      expect(screen.getByTestId('footer').className).toContain('custom-footer');
    });
  });

  describe('SheetTitle', () => {
    it('renders with default classes', () => {
      render(
        <Sheet>
          <SheetTitle data-testid="title">Sheet Title</SheetTitle>
        </Sheet>
      );
      const title = screen.getByTestId('title');
      expect(title).toBeInTheDocument();
      expect(title.className).toContain('text-lg font-semibold text-foreground');
    });

    it('applies custom className', () => {
      render(
        <Sheet>
          <SheetTitle className="custom-title" data-testid="title">Sheet Title</SheetTitle>
        </Sheet>
      );
      expect(screen.getByTestId('title').className).toContain('custom-title');
    });
  });
});