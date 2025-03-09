import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../../components/ui/resizable';
import * as ResizablePrimitive from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';

// Mock the external dependencies
vi.mock('react-resizable-panels', () => ({
    PanelGroup: vi.fn(({ className, children, ...props }) => (
        <div data-testid="panel-group" className={className} {...props}>{children}</div>
    )),
    Panel: vi.fn(({ children, ...props }) => (
        <div data-testid="panel" {...props}>{children}</div>
    )),
    PanelResizeHandle: vi.fn(({ className, children, ...props }) => (
        <div data-testid="panel-resize-handle" className={className} {...props}>{children}</div>
    ))
}));

vi.mock('lucide-react', () => ({
    GripVertical: vi.fn(() => <div data-testid="grip-vertical" />)
}));

vi.mock('@/lib/utils', () => ({
    cn: (...args: any) => args.filter(Boolean).join(' ')
}));

describe('Resizable Components', () => {
    describe('ResizablePanelGroup', () => {
        it('renders with correct classes', () => {
            const { getByTestId } = render(<ResizablePanelGroup className="custom-class" />);
            const element = getByTestId('panel-group');
            expect(element.className).toContain('flex h-full w-full');
            expect(element.className).toContain('custom-class');
        });
    });

    describe('ResizablePanel', () => {
        it('passes props to the underlying component', () => {
            const { getByTestId } = render(<ResizablePanel id="test-id" />);
            const element = getByTestId('panel');
            expect(element.id).toBe('test-id');
        });
    });

    describe('ResizableHandle', () => {
        it('renders without handle by default', () => {
            const { queryByTestId, getByTestId } = render(<ResizableHandle />);
            expect(getByTestId('panel-resize-handle')).toBeTruthy();
            expect(queryByTestId('grip-vertical')).toBeNull();
        });

        it('renders with handle when withHandle is true', () => {
            const { getByTestId } = render(<ResizableHandle withHandle />);
            expect(getByTestId('grip-vertical')).toBeTruthy();
        });

        it('applies custom class names', () => {
            const { getByTestId } = render(<ResizableHandle className="custom-handle" />);
            const element = getByTestId('panel-resize-handle');
            expect(element.className).toContain('custom-handle');
        });
    });
});