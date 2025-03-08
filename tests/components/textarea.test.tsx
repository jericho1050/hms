import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { Textarea } from '../../components/ui/textarea'

describe('Textarea', () => {
    beforeEach(() => {
        // Reset the DOM after each test
        document.body.innerHTML = ''
    })

    it('renders correctly', () => {
        render(<Textarea data-testid="test-textarea" />)
        expect(screen.getByTestId('test-textarea')).toBeInTheDocument()
    })

    it('applies default and custom className', () => {
        const { container } = render(<Textarea className="custom-class" />)
        const textarea = container.querySelector('textarea')
        expect(textarea).toHaveClass('custom-class')
        expect(textarea).toHaveClass('flex')
        expect(textarea).toHaveClass('min-h-[80px]')
    })

    it('passes props to the underlying textarea', () => {
        render(<Textarea placeholder="Enter text here" disabled />)
        const textarea = screen.getByRole('textbox')
        expect(textarea).toHaveAttribute('placeholder', 'Enter text here')
        expect(textarea).toBeDisabled()
    })

    it('forwards ref to the underlying textarea', () => {
        const ref = React.createRef<HTMLTextAreaElement>()
        render(<Textarea ref={ref} />)
        expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })

    it('has correct displayName', () => {
        expect(Textarea.displayName).toBe('Textarea')
    })
})