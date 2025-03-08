import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRouter, usePathname } from 'next/navigation';
import { within } from '@testing-library/react';
import { NavBar } from '@/components/nav-bar';
import { useAuth } from '@/hooks/use-auth';

// Mock hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

describe('NavBar', () => {
  it('renders the brand name and logo', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    (usePathname as any).mockReturnValue('/');
    (useRouter as any).mockReturnValue({ push: vi.fn() });

    render(<NavBar />);
    expect(screen.getByText('CareSanar')).toBeInTheDocument();
  });

  it('displays login and sign up when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    (usePathname as any).mockReturnValue('/');
    (useRouter as any).mockReturnValue({ push: vi.fn() });

    render(<NavBar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('displays navigation links when authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { email: 'test@example.com' },
    });
    (usePathname as any).mockReturnValue('/');
    (useRouter as any).mockReturnValue({ push: vi.fn() });

    render(<NavBar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    render(<NavBar />);

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);

    // Now we specifically check inside the mobile menu container:
    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(within(mobileMenu).getByText('Login')).toBeInTheDocument();
  });

  it('calls signOut and redirects on logout', async () => {
    const pushMock = vi.fn();
    const signOutMock = vi.fn().mockResolvedValue(undefined); // Mock as resolved promise
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { email: 'test@example.com' },
      signOut: signOutMock,
    });
    (usePathname as any).mockReturnValue('/');
    (useRouter as any).mockReturnValue({ push: pushMock });
  
    render(<NavBar />);
    
    // Open the mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
  
    // Find the logout button in the mobile menu
    const mobileMenu = screen.getByTestId('mobile-menu');
    const logoutButton = within(mobileMenu).getByTestId('mobile-logout-button');  
    
    // Click and wait for the async operation to complete
    await fireEvent.click(logoutButton);
    
    // Allow any pending promises to resolve
    await vi.waitFor(() => {
      expect(signOutMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/auth/login');
    });
  });
});
