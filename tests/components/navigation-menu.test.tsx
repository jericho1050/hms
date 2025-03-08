import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

// Mock ResizeObserver for tests
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock the Portal to render in the test DOM instead of outside
vi.mock('@radix-ui/react-navigation-menu', async () => {
  const actual = await vi.importActual('@radix-ui/react-navigation-menu');
  return {
    ...actual,
    // Force components to render children directly for testing
    Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Viewport: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  };
});

describe('NavigationMenu', () => {
  it('renders correctly with children', () => {
    const { container } = render(
      <NavigationMenu>
        <div>Test Content</div>
      </NavigationMenu>
    );
    expect(container.textContent).toContain('Test Content');
  });

  it('applies custom className', () => {
    const { container } = render(
      <NavigationMenu className="custom-class">
        <div>Content</div>
      </NavigationMenu>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('NavigationMenuList', () => {
  it('renders correctly with children', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList data-testid="list">
          <div>List Items</div>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(screen.getByTestId('list')).toBeInTheDocument();
    expect(screen.getByTestId('list').textContent).toContain('List Items');
  });

  it('applies custom className', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList data-testid="list" className="custom-list-class">
          <div>Content</div>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(screen.getByTestId('list')).toHaveClass('custom-list-class');
  });
});

describe('NavigationMenuTrigger', () => {
  it('renders children with chevron icon', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid="trigger">
              Dropdown
            </NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByTestId('trigger').textContent).toContain('Dropdown');
  });

  it('applies navigationMenuTriggerStyle', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid="trigger">
              Styled Trigger
            </NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    // Check for some of the classes applied by navigationMenuTriggerStyle
    expect(screen.getByTestId('trigger')).toHaveClass('group', 'inline-flex');
  });
});

describe('NavigationMenuContent', () => {
  it('renders children correctly', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Trigger</NavigationMenuTrigger>
            <NavigationMenuContent data-testid="content">
              <div>Content</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('content').textContent).toContain('Content');
  });

  it('applies custom className', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Trigger</NavigationMenuTrigger>
            <NavigationMenuContent data-testid="content" className="custom-content-class">
              <div>Content</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(screen.getByTestId('content')).toHaveClass('custom-content-class');
  });
});

describe('NavigationMenuViewport', () => {
  it('renders with default classes', () => {
    render(
      <NavigationMenu>
        <NavigationMenuViewport data-testid="viewport" />
      </NavigationMenu>
    );
    // Just test that it renders - the viewport is usually managed by NavigationMenu
    expect(screen.getByTestId('viewport')).toBeInTheDocument();
  });
});

describe('navigationMenuTriggerStyle', () => {
  it('returns a string of classes', () => {
    const result = navigationMenuTriggerStyle();
    expect(typeof result).toBe('string');
    expect(result).toContain('inline-flex');
    expect(result).toContain('rounded-md');
  });
});