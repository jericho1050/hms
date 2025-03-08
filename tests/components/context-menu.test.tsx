import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup
} from '@/components/ui/context-menu'

describe('ContextMenu', () => {
  it('renders context menu components correctly', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right click me</ContextMenuTrigger>
        <ContextMenuContent data-testid="content">
          <ContextMenuItem data-testid="item">Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )

    // Initially, the content is hidden
    expect(screen.getByTestId('trigger')).toBeInTheDocument()
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('renders menu items with correct styles', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem data-testid="menu-item">Test Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )

    // Open the menu first
    fireEvent.contextMenu(screen.getByTestId('trigger'))

    // Now [data-testid="menu-item"] is rendered
    const menuItem = screen.getByTestId('menu-item')
    expect(menuItem).toHaveClass('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none')
  })

  it('applies inset class when inset prop is true', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem data-testid="inset-item" inset>
            Inset Item
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )

    // Open the menu
    fireEvent.contextMenu(screen.getByTestId('trigger'))

    const insetItem = screen.getByTestId('inset-item')
    expect(insetItem).toHaveClass('pl-8')
  })

  it('renders checkbox item with correct checked state', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem data-testid="checkbox-item" checked>
            Checkbox Item
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    )

    // Open the menu
    fireEvent.contextMenu(screen.getByTestId('trigger'))

    expect(screen.getByTestId('checkbox-item')).toHaveAttribute('data-state', 'checked')
  })

  it('renders shortcut with correct classes', () => {
    // This test doesn’t need the menu, so no right-click necessary
    render(<ContextMenuShortcut data-testid="shortcut">Ctrl+S</ContextMenuShortcut>)

    const shortcut = screen.getByTestId('shortcut')
    expect(shortcut).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground')
    expect(shortcut).toHaveTextContent('Ctrl+S')
  })

  it('renders separator with correct classes', () => {
    // This test also doesn’t need the menu open
    render(<ContextMenuSeparator data-testid="separator" />)

    expect(screen.getByTestId('separator')).toHaveClass('h-px bg-border')
  })

  it('renders submenu components correctly', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger data-testid="sub-trigger">More Options</ContextMenuSubTrigger>
            <ContextMenuSubContent data-testid="sub-content">
              <ContextMenuItem>Sub Item</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    )

    // Open the menu
    fireEvent.contextMenu(screen.getByTestId('trigger'))

    // The sub-trigger is now in the DOM
    expect(screen.getByTestId('sub-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('sub-trigger').textContent).toContain('More Options')
  })

  it('renders radio items correctly in a radio group', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup value="option1">
            <ContextMenuRadioItem data-testid="radio-1" value="option1">
              Option 1
            </ContextMenuRadioItem>
            <ContextMenuRadioItem data-testid="radio-2" value="option2">
              Option 2
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    )

    // Open the menu
    fireEvent.contextMenu(screen.getByTestId('trigger'))

    expect(screen.getByTestId('radio-1')).toHaveAttribute('data-state', 'checked')
    expect(screen.getByTestId('radio-2')).toHaveAttribute('data-state', 'unchecked')
  })

  it('applies custom className to components', () => {
    // No context menu needed here
    render(
      <ContextMenuLabel data-testid="label" className="custom-class">
        Label
      </ContextMenuLabel>
    )

    expect(screen.getByTestId('label')).toHaveClass('custom-class')
  })
})