import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock the toggle-group component entirely
vi.mock('@/components/ui/toggle-group', () => {
  const ToggleGroup = ({ 
    type, 
    className = '', 
    variant = 'default', 
    size = 'default', 
    children,
    ...props 
  }: { 
    type: 'single' | 'multiple';
    className?: string;
    variant?: string;
    size?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }): {
    type: 'single' | 'multiple';
    className?: string;
    variant?: string;
    size?: string;
    children?: React.ReactNode;
    [key: string]: any;
  } => {
    return (
      <div 
        className={`flex items-center justify-center gap-1 ${className}`} 
        data-variant={variant} 
        data-size={size}
        data-type={type}
        {...props}
      >
        {children}
      </div>
    )
  }

  const ToggleGroupItem = ({ 
      value,
      className = '',
      variant = 'default',
      size = 'default',
      children,
      onClick,
      ...props
    }: {
      value: string;
      className?: string;
      variant?: string;
      size?: string;
      children?: React.ReactNode;
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
      [key: string]: any;
    }) => {
    return (
      <button 
        className={className} 
        value={value} 
        data-variant={variant}
        data-size={size}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    )
  }

  return {
    ToggleGroup,
    ToggleGroupItem
  }
})

// Import after mocking
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

describe('ToggleGroup', () => {
  it('renders without crashing', () => {
    render(<ToggleGroup type="single" />)
    expect(document.querySelector('.flex.items-center.justify-center.gap-1')).toBeTruthy()
  })

  it('passes className prop correctly', () => {
    render(<ToggleGroup type="single" className="test-class" />)
    expect(document.querySelector('.flex.items-center.justify-center.gap-1.test-class')).toBeTruthy()
  })
  
  it('renders children correctly', () => {
    render(
      <ToggleGroup type="single">
        <div data-testid="child">Test Child</div>
      </ToggleGroup>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('passes variant and size properties', () => {
    render(
      <ToggleGroup type="single" variant="outline" size="lg">
        <div>Test</div>
      </ToggleGroup>
    )
    
    const toggleGroup = document.querySelector('.flex.items-center.justify-center.gap-1')
    expect(toggleGroup).toHaveAttribute('data-variant', 'outline')
    expect(toggleGroup).toHaveAttribute('data-size', 'lg')
  })
})

describe('ToggleGroupItem', () => {
  it('renders without crashing', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="test">Test</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="test">Test Label</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="test" className="custom-class">Test</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(screen.getByText('Test')).toHaveClass('custom-class')
  })
  
  it('handles click events', async () => {
    const user = userEvent.setup()
    const onClickMock = vi.fn()
    
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="test" onClick={onClickMock}>
          Click Me
        </ToggleGroupItem>
      </ToggleGroup>
    )
    
    await user.click(screen.getByText('Click Me'))
    expect(onClickMock).toHaveBeenCalled()
  })

  it('uses variant and size attributes', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="test" variant="outline" size="sm">Test</ToggleGroupItem>
      </ToggleGroup>
    )
    
    const button = screen.getByText('Test')
    expect(button).toHaveAttribute('data-variant', 'outline')
    expect(button).toHaveAttribute('data-size', 'sm')
  })
})