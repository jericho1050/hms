import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster } from '../../components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('@/components/ui/toast', () => ({
  Toast: vi.fn(({ children, ...props }) => <div data-testid="toast" {...props}>{children}</div>),
  ToastClose: vi.fn(() => <button data-testid="toast-close">Close</button>),
  ToastDescription: vi.fn(({ children }) => <div data-testid="toast-description">{children}</div>),
  ToastProvider: vi.fn(({ children }) => <div data-testid="toast-provider">{children}</div>),
  ToastTitle: vi.fn(({ children }) => <div data-testid="toast-title">{children}</div>),
  ToastViewport: vi.fn(() => <div data-testid="toast-viewport" />)
}));

describe('Toaster Component', () => {
  it('renders the ToastProvider and ToastViewport', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [],
      toast: vi.fn(() => ({ id: '1', dismiss: vi.fn(), update: vi.fn() })),
      dismiss: vi.fn()
    });
    
    render(<Toaster />);
    
    expect(screen.getByTestId('toast-provider')).toBeTruthy();
    expect(screen.getByTestId('toast-viewport')).toBeTruthy();
  });
  
  it('renders a toast with title and description', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        { id: '1', title: 'Test Title', description: 'Test Description' }
      ],
      toast: vi.fn(() => ({ id: '1', dismiss: vi.fn(), update: vi.fn() })),
      dismiss: vi.fn()
    });
    
    render(<Toaster />);
    
    expect(screen.getByTestId('toast')).toBeTruthy();
    expect(screen.getByTestId('toast-title')).toBeTruthy();
    expect(screen.getByTestId('toast-title')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('toast-description')).toBeTruthy();
    expect(screen.getByTestId('toast-description')).toHaveTextContent('Test Description');
    expect(screen.getByTestId('toast-close')).toBeTruthy();
  });
  
  it('renders a toast with only title', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        { id: '1', title: 'Only Title' }
      ],
      toast: vi.fn(() => ({ id: '1', dismiss: vi.fn(), update: vi.fn() })),
      dismiss: vi.fn()
    });
    
    render(<Toaster />);
    
    expect(screen.getByTestId('toast-title')).toHaveTextContent('Only Title');
    expect(screen.queryByTestId('toast-description')).toBeNull();
  });
  
  it('renders a toast with only description', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        { id: '1', description: 'Only Description' }
      ],
      toast: vi.fn(() => ({ id: '1', dismiss: vi.fn(), update: vi.fn() })),
      dismiss: vi.fn()
    });
    
    render(<Toaster />);
    
    expect(screen.queryByTestId('toast-title')).toBeNull();
    expect(screen.getByTestId('toast-description')).toHaveTextContent('Only Description');
  });
  
  it('renders multiple toasts', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        { id: '1', title: 'Toast 1' },
        { id: '2', title: 'Toast 2' }
      ],
      toast: vi.fn(() => ({ id: '1', dismiss: vi.fn(), update: vi.fn() })),
      dismiss: vi.fn()
    });
    
    render(<Toaster />);
    
    const toasts = screen.getAllByTestId('toast');
    expect(toasts).toHaveLength(2);
  });
  
  it('renders a toast with action', () => {
    const mockAction = <button data-testid="toast-action">Action</button>;
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        { id: '1', title: 'With Action', action: mockAction }
      ],
      toast: vi.fn(() => ({ id: '1', dismiss: vi.fn(), update: vi.fn() })),
      dismiss: vi.fn()
    });
    
    render(<Toaster />);
    
    expect(screen.getByTestId('toast-action')).toBeTruthy();
  });
});