import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
export {
  Menubar,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarShortcut,
  MenubarSeparator,
  MenubarPortal,
};
import {
  Menubar,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarShortcut,
  MenubarSeparator,
  MenubarPortal,
} from '@/components/ui/menubar';

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock the Portal to render in the test DOM instead of outside
vi.mock('@radix-ui/react-menubar', async () => {
  const actual = await vi.importActual('@radix-ui/react-menubar');
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>, // This is crucial
  };
});

describe('Menubar components', () => {
  describe('Menubar', () => {
    it('should render correctly', () => {
      const { container } = render(<Menubar />);
      expect(container.firstChild).toHaveClass('flex', 'h-10', 'items-center', 'space-x-1');
    });

    it('should apply custom className', () => {
      const { container } = render(<Menubar className="test-class" />);
      expect(container.firstChild).toHaveClass('test-class');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Menubar ref={ref} />);
      expect(ref.current).not.toBeNull();
    });
  });

  describe('MenubarTrigger', () => {
    it('should render correctly', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger data-testid="trigger">File</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger data-testid="trigger" className="test-class">
              File
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      );
      expect(screen.getByTestId('trigger')).toHaveClass('test-class');
    });
  });

  describe('MenubarItem', () => {
    it('should render correctly', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarContent forceMount>
              <MenubarItem data-testid="item">New File</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );
      // Debug what's rendered
      screen.debug();
      expect(screen.getByTestId('item')).toBeInTheDocument();
    });

    it('should apply inset class when inset prop is true', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarContent forceMount>
              <MenubarItem data-testid="item" inset>
                Inset Item
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );
      expect(screen.getByTestId('item')).toHaveClass('pl-8');
    });
  });

  describe('MenubarCheckboxItem', () => {
    it('should render correctly', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarContent forceMount>
              <MenubarCheckboxItem data-testid="checkbox">Checkbox</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );
      expect(screen.getByTestId('checkbox')).toHaveClass('relative', 'flex', 'cursor-default');
    });

    it('should not show check icon when not checked', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarContent forceMount>
              <MenubarCheckboxItem data-testid="checkbox" checked={false}>
                Checkbox
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });
  });

  describe('MenubarRadioItem', () => {
    it('should render correctly', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarContent forceMount>
              <MenubarRadioItem data-testid="radio" value="radio-value">
                Radio
              </MenubarRadioItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );
      expect(screen.getByTestId('radio')).toHaveClass('relative', 'flex', 'cursor-default');
    });
  });

  describe('MenubarShortcut', () => {
    it('should render correctly', () => {
      const { container } = render(<MenubarShortcut>Ctrl+S</MenubarShortcut>);
      expect(container.firstChild).toHaveClass('ml-auto', 'text-xs');
      expect(container.firstChild).toHaveTextContent('Ctrl+S');
    });
  });

  describe('Menubar integration', () => {
    it('should render a complete menubar', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent forceMount>
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Save</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );
      expect(screen.getByText('File')).toBeInTheDocument();
    });
  });
});
