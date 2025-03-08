import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { DayPicker } from 'react-day-picker';

// Mock dependencies
vi.mock('react-day-picker', () => ({
  DayPicker: vi.fn(() => <div data-testid="day-picker" />)
}));

vi.mock('@radix-ui/react-icons', () => ({
  ChevronLeftIcon: () => <div data-testid="chevron-left" />,
  ChevronRightIcon: () => <div data-testid="chevron-right" />
}));

vi.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' ')
}));

vi.mock('@/components/ui/button', () => ({
  buttonVariants: () => 'button-variant'
}));

describe('Calendar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<Calendar />);
    const [firstArg] = (DayPicker as any).mock.calls[0];
    expect(firstArg).toEqual(
      expect.objectContaining({
        showOutsideDays: true,
        className: expect.stringContaining('p-3'),
      })
    );
  });

  it('renders with custom showOutsideDays prop', () => {
    render(<Calendar showOutsideDays={false} />);
    const [firstArg] = (DayPicker as any).mock.calls[0];
    expect(firstArg).toEqual(
      expect.objectContaining({
        showOutsideDays: false,
      })
    );
  });

  it('renders with custom className', () => {
    render(<Calendar className="custom-class" />);
    const [firstArg] = (DayPicker as any).mock.calls[0];
    expect(firstArg).toEqual(
      expect.objectContaining({
        className: expect.stringContaining('custom-class'),
      })
    );
  });

  it('merges custom classNames with defaults', () => {
    const customClassNames = {
      months: 'custom-months',
      day: 'custom-day'
    };
    
    render(<Calendar classNames={customClassNames} />);
    const [firstArg] = (DayPicker as any).mock.calls[0];
    const { classNames } = firstArg;
    
    expect(classNames.months).toContain('custom-months');
    expect(classNames.months).toContain('flex');  // from default
    expect(classNames.day).toContain('custom-day');
    expect(classNames.day).toContain('font-normal');  // from default
  });

  it('renders Chevron component with correct icon based on orientation', () => {
    render(<Calendar />);
    const [firstArg] = (DayPicker as any).mock.calls[0];
    const ChevronComponent = firstArg.components.Chevron;
    
    const { getByTestId: getLeftIcon } = render(<ChevronComponent orientation="left" />);
    expect(getLeftIcon('chevron-left')).toBeInTheDocument();
    
    const { getByTestId: getRightIcon } = render(<ChevronComponent orientation="right" />);
    expect(getRightIcon('chevron-right')).toBeInTheDocument();
  });

  it('has correct displayName', () => {
    expect(Calendar.displayName).toBe('Calendar');
  });
});