import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {

Table,
TableHeader,
TableBody,
TableFooter,
TableHead,
TableRow,
TableCell,
TableCaption
} from '../../components/ui/table';

describe('Table Components', () => {
describe('Table', () => {
    it('renders with default classes', () => {
        render(<Table data-testid="table" />);
        const table = screen.getByTestId('table');
        expect(table).toBeInTheDocument();
        expect(table.tagName).toBe('TABLE');
        expect(table).toHaveClass('w-full caption-bottom text-sm');
    });

    it('applies custom className', () => {
        render(<Table data-testid="table" className="custom-class" />);
        const table = screen.getByTestId('table');
        expect(table).toHaveClass('custom-class');
    });
});

describe('TableHeader', () => {
    it('renders with default classes', () => {
        render(<TableHeader data-testid="thead" />);
        const thead = screen.getByTestId('thead');
        expect(thead).toBeInTheDocument();
        expect(thead.tagName).toBe('THEAD');
        expect(thead).toHaveClass('[&_tr]:border-b');
    });
});

describe('TableBody', () => {
    it('renders with default classes', () => {
        render(<TableBody data-testid="tbody" />);
        const tbody = screen.getByTestId('tbody');
        expect(tbody).toBeInTheDocument();
        expect(tbody.tagName).toBe('TBODY');
        expect(tbody).toHaveClass('[&_tr:last-child]:border-0');
    });
});

describe('TableFooter', () => {
    it('renders with default classes', () => {
        render(<TableFooter data-testid="tfoot" />);
        const tfoot = screen.getByTestId('tfoot');
        expect(tfoot).toBeInTheDocument();
        expect(tfoot.tagName).toBe('TFOOT');
        expect(tfoot).toHaveClass('border-t bg-muted/50 font-medium');
    });
});

describe('TableRow', () => {
    it('renders with default classes', () => {
        render(<TableRow data-testid="tr" />);
        const tr = screen.getByTestId('tr');
        expect(tr).toBeInTheDocument();
        expect(tr.tagName).toBe('TR');
        expect(tr).toHaveClass('border-b transition-colors hover:bg-muted/50');
    });
    
    it('applies selected state class', () => {
        render(<TableRow data-testid="tr" data-state="selected" />);
        const tr = screen.getByTestId('tr');
        expect(tr).toHaveAttribute('data-state', 'selected');
    });
});

describe('TableHead', () => {
    it('renders with default classes', () => {
        render(<TableHead data-testid="th" />);
        const th = screen.getByTestId('th');
        expect(th).toBeInTheDocument();
        expect(th.tagName).toBe('TH');
        expect(th).toHaveClass('h-12 px-4 text-left align-middle font-medium text-muted-foreground');
    });
});

describe('TableCell', () => {
    it('renders with default classes', () => {
        render(<TableCell data-testid="td" />);
        const td = screen.getByTestId('td');
        expect(td).toBeInTheDocument();
        expect(td.tagName).toBe('TD');
        expect(td).toHaveClass('p-4 align-middle');
    });
});

describe('TableCaption', () => {
    it('renders with default classes', () => {
        render(<TableCaption data-testid="caption" />);
        const caption = screen.getByTestId('caption');
        expect(caption).toBeInTheDocument();
        expect(caption.tagName).toBe('CAPTION');
        expect(caption).toHaveClass('mt-4 text-sm text-muted-foreground');
    });
});

describe('Table integration', () => {
    it('renders a complete table structure', () => {
        render(
            <Table data-testid="table">
                <TableCaption>Test Caption</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Header 1</TableHead>
                        <TableHead>Header 2</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Cell 1</TableCell>
                        <TableCell>Cell 2</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>Footer 1</TableCell>
                        <TableCell>Footer 2</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        );
        
        expect(screen.getByTestId('table')).toBeInTheDocument();
        expect(screen.getByText('Test Caption')).toBeInTheDocument();
        expect(screen.getByText('Header 1')).toBeInTheDocument();
        expect(screen.getByText('Cell 1')).toBeInTheDocument();
        expect(screen.getByText('Footer 1')).toBeInTheDocument();
    });
});
});