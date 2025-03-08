import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import {

DropdownMenu,
DropdownMenuTrigger,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuCheckboxItem,
DropdownMenuRadioItem,
DropdownMenuLabel,
DropdownMenuSeparator,
DropdownMenuShortcut,
DropdownMenuGroup,
DropdownMenuSub,
DropdownMenuSubContent,
DropdownMenuSubTrigger,
DropdownMenuRadioGroup,
} from '@/components/ui/dropdown-menu';

describe('DropdownMenu', () => {
it('renders with basic components', async () => {
    const user = userEvent.setup();
    
    render(
        <DropdownMenu>
            <DropdownMenuTrigger data-testid="trigger">Open</DropdownMenuTrigger>
            <DropdownMenuContent data-testid="content">
                <DropdownMenuItem data-testid="menu-item">Item</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toBeInTheDocument();

    // Content should be hidden initially
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    // Open the dropdown
    await user.click(trigger);
    
    // Content should now be visible
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
});

it('renders checkbox item with checked state', async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    
    render(
        <DropdownMenu defaultOpen>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuCheckboxItem 
                    checked={true}
                    onCheckedChange={onCheckedChange}
                    data-testid="checkbox-item"
                >
                    Checkbox Item
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const checkboxItem = screen.getByTestId('checkbox-item');
    expect(checkboxItem).toBeInTheDocument();
    expect(checkboxItem).toHaveAttribute('data-state', 'checked');
    
    await user.click(checkboxItem);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
});

it('renders radio group with radio items', () => {
    render(
        <DropdownMenu defaultOpen>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuRadioGroup value="1">
                    <DropdownMenuRadioItem value="1" data-testid="radio-1">Option 1</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="2" data-testid="radio-2">Option 2</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    expect(screen.getByTestId('radio-1')).toHaveAttribute('data-state', 'checked');
    expect(screen.getByTestId('radio-2')).toHaveAttribute('data-state', 'unchecked');
});

it('renders sub menu components', async () => {
    const user = userEvent.setup();
    
    render(
        <DropdownMenu defaultOpen>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger data-testid="sub-trigger">Sub Menu</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent data-testid="sub-content">
                        <DropdownMenuItem>Sub Item</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const subTrigger = screen.getByTestId('sub-trigger');
    expect(subTrigger).toBeInTheDocument();
    
    await user.hover(subTrigger);
    // Need to allow time for sub-content to appear
    await new Promise(r => setTimeout(r, 100));
    
    expect(screen.getByTestId('sub-content')).toBeInTheDocument();
});

it('renders label and separator correctly', () => {
    render(
        <DropdownMenu defaultOpen>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel data-testid="label">Label</DropdownMenuLabel>
                <DropdownMenuSeparator data-testid="separator" />
                <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    expect(screen.getByTestId('label')).toBeInTheDocument();
    expect(screen.getByTestId('label')).toHaveTextContent('Label');
    expect(screen.getByTestId('separator')).toBeInTheDocument();
});

it('renders shortcut correctly', () => {
    render(
        <DropdownMenu defaultOpen>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    Item
                    <DropdownMenuShortcut data-testid="shortcut">⌘+K</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    expect(screen.getByTestId('shortcut')).toBeInTheDocument();
    expect(screen.getByTestId('shortcut')).toHaveTextContent('⌘+K');
});
});