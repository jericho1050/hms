import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from '@/components/ui/progress'

describe('Progress component', () => {
    it('renders properly', () => {
        render(<Progress value={0} data-testid="progress" />)
        expect(screen.getByTestId('progress')).toBeInTheDocument()
    })

    it('applies custom className', () => {
        render(<Progress value={0} className="custom-class" data-testid="progress" />)
        expect(screen.getByTestId('progress')).toHaveClass('custom-class')
    })

    it('displays the progress value correctly', () => {
        const { rerender } = render(<Progress value={25} data-testid="progress" />)
        const indicator = screen.getByTestId('progress').firstChild as HTMLElement
        expect(indicator.style.transform).toBe('translateX(-75%)')
        
        rerender(<Progress value={50} data-testid="progress" />)
        expect(indicator.style.transform).toBe('translateX(-50%)')
        
        rerender(<Progress value={100} data-testid="progress" />)
        expect(indicator.style.transform).toBe('translateX(-0%)')
        
        // Test undefined value (should default to 0)
        rerender(<Progress data-testid="progress" />)
        expect(indicator.style.transform).toBe('translateX(-100%)')
    })

    it('forwards ref', () => {
        const ref = React.createRef<HTMLDivElement>()
        render(<Progress ref={ref} value={50} />)
        expect(ref.current).not.toBeNull()
    })

    it('forwards additional props to the root element', () => {
        render(<Progress value={50} aria-label="Loading progress" data-testid="progress" />)
        expect(screen.getByTestId('progress')).toHaveAttribute('aria-label', 'Loading progress')
    })
})