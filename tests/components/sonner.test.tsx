import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Toaster } from '../../components/ui/sonner';
import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

// Mock dependencies
vi.mock('next-themes', () => ({
  useTheme: vi.fn()
}));

// Create a spy on the Sonner Toaster component
vi.mock('sonner', () => {
  const mockSonnerToaster = vi.fn().mockImplementation(() => null);
  return { Toaster: mockSonnerToaster };
});

describe('Toaster Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'system',
      setTheme: vi.fn(),
      themes: []
    });
  });

  it('renders with correct theme from useTheme', () => {
    render(<Toaster />);
    
    const callArgs = vi.mocked(SonnerToaster).mock.calls[0][0];
    expect(callArgs).toMatchObject({
      theme: 'system',
      className: 'toaster group'
    });
  });

  it('passes dark theme when useTheme returns dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      themes: []
    });
    
    render(<Toaster />);
    
    const callArgs = vi.mocked(SonnerToaster).mock.calls[0][0];
    expect(callArgs).toMatchObject({
      theme: 'dark'
    });
  });

  it('passes additional props to Sonner component', () => {
    render(<Toaster position="top-right" />);
    
    const callArgs = vi.mocked(SonnerToaster).mock.calls[0][0];
    expect(callArgs).toMatchObject({
      position: 'top-right'
    });
  });

  it('passes correct toast options including classNames', () => {
    render(<Toaster />);
    
    // Get the first call arguments to the mocked Sonner Toaster
    const callArgs = vi.mocked(SonnerToaster).mock.calls[0][0];
    
    expect(callArgs).toHaveProperty('toastOptions');
    expect(callArgs.toastOptions).toHaveProperty('classNames');
    
    const classNames = callArgs.toastOptions?.classNames as Record<string, string>;
    expect(classNames.toast).toContain('group-[.toaster]:bg-background');
    expect(classNames.description).toContain('group-[.toast]:text-muted-foreground');
    expect(classNames.actionButton).toContain('group-[.toast]:bg-primary');
    expect(classNames.cancelButton).toContain('group-[.toast]:bg-muted');
  });
});