import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import {

Pagination,
PaginationContent,
PaginationEllipsis,
PaginationItem,
PaginationLink,
PaginationNext,
PaginationPrevious,
} from '@/components/ui/pagination'

describe('Pagination Components', () => {
describe('Pagination', () => {
    it('renders correctly with default props', () => {
        render(<Pagination />)
        const nav = screen.getByRole('navigation')
        expect(nav).toBeInTheDocument()
        expect(nav).toHaveAttribute('aria-label', 'pagination')
    })

    it('applies custom className', () => {
        render(<Pagination className="test-class" />)
        expect(screen.getByRole('navigation')).toHaveClass('test-class')
    })
})

describe('PaginationContent', () => {
    it('renders correctly', () => {
        render(<PaginationContent data-testid="pagination-content" />)
        expect(screen.getByTestId('pagination-content')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
        const ref = React.createRef<HTMLUListElement>()
        render(<PaginationContent ref={ref} data-testid="pagination-content" />)
        expect(ref.current).not.toBeNull()
    })
})

describe('PaginationItem', () => {
    it('renders correctly', () => {
        render(<PaginationItem data-testid="pagination-item" />)
        expect(screen.getByTestId('pagination-item')).toBeInTheDocument()
    })
})

describe('PaginationLink', () => {
    it('renders an anchor element', () => {
        render(<PaginationLink href="#" data-testid="pagination-link">Page 1</PaginationLink>)
        expect(screen.getByTestId('pagination-link')).toBeInTheDocument()
    })

    it('applies correct styles when active', () => {
        render(<PaginationLink href="#" isActive>Active Page</PaginationLink>)
        const link = screen.getByText('Active Page')
        expect(link).toHaveAttribute('aria-current', 'page')
    })

    it('applies default size', () => {
        render(<PaginationLink href="#" data-testid="pagination-link">Link</PaginationLink>)
        // The button variant classes are applied through the buttonVariants function
        expect(screen.getByTestId('pagination-link')).toBeInTheDocument()
    })

    it('passes custom className correctly', () => {
        render(<PaginationLink href="#" className="custom-class" data-testid="pagination-link">Link</PaginationLink>)
        expect(screen.getByTestId('pagination-link')).toHaveClass('custom-class')
    })
})

describe('PaginationPrevious', () => {
    it('renders correctly with proper text', () => {
        render(<PaginationPrevious href="#" />)
        expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    it('has correct aria-label', () => {
        render(<PaginationPrevious href="#" />)
        expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Go to previous page')
    })
})

describe('PaginationNext', () => {
    it('renders correctly with proper text', () => {
        render(<PaginationNext href="#" />)
        expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('has correct aria-label', () => {
        render(<PaginationNext href="#" />)
        expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Go to next page')
    })
})

describe('PaginationEllipsis', () => {
    it('renders correctly', () => {
        render(<PaginationEllipsis />)
        expect(screen.getByText('More pages', { selector: '.sr-only' })).toBeInTheDocument()
    })

    it('is marked as aria-hidden', () => {
        render(<PaginationEllipsis />)
        const ellipsis = screen.getByText('More pages', { selector: '.sr-only' }).parentElement
        expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
    })
})
})