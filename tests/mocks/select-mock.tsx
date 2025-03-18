import React from 'react';
import { vi } from 'vitest';

// Mock the Radix UI Select components
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => {
    return <div data-testid="select-root">{children}</div>;
  },
  SelectTrigger: ({ children, id }: any) => <button data-testid="select-trigger" id={id}>{children}</button>,
  SelectValue: ({ placeholder, children }: any) => <span data-testid="select-value">{children || placeholder}</span>,
  SelectContent: ({ children, className }: any) => <div data-testid="select-content" className={className}>{children}</div>,
  SelectItem: ({ children, value, disabled }: any) => (
    <div 
      data-testid={`select-item-${value}`} 
      data-value={value}
      role="option"
      aria-disabled={disabled ? 'true' : 'false'}
      onClick={() => window.dispatchEvent(new CustomEvent('select-item-clicked', { detail: { value } }))}
    >
      {children}
    </div>
  ),
}));

// Export a helper function to simulate selecting an item
export const selectOption = (value: string) => {
  window.dispatchEvent(new CustomEvent('select-item-clicked', { detail: { value } }));
};