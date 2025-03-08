import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import {
Breadcrumb,
BreadcrumbList,
BreadcrumbItem,
BreadcrumbLink,
BreadcrumbPage,
BreadcrumbSeparator,
BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

describe("Breadcrumb", () => {
it("renders Breadcrumb component with correct attributes", () => {
    render(<Breadcrumb data-testid="breadcrumb" />);
    const breadcrumb = screen.getByTestId("breadcrumb");
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb.tagName.toLowerCase()).toBe("nav");
    expect(breadcrumb).toHaveAttribute("aria-label", "breadcrumb");
});

it("renders BreadcrumbList component with correct class names", () => {
    render(<BreadcrumbList data-testid="breadcrumb-list" />);
    const list = screen.getByTestId("breadcrumb-list");
    expect(list).toBeInTheDocument();
    expect(list.tagName.toLowerCase()).toBe("ol");
    expect(list.className).toContain("flex");
    expect(list.className).toContain("flex-wrap");
    expect(list.className).toContain("items-center");
});

it("applies custom className to BreadcrumbList", () => {
    render(<BreadcrumbList data-testid="breadcrumb-list" className="custom-class" />);
    const list = screen.getByTestId("breadcrumb-list");
    expect(list.className).toContain("custom-class");
});

it("renders BreadcrumbItem component with correct class names", () => {
    render(<BreadcrumbItem data-testid="breadcrumb-item" />);
    const item = screen.getByTestId("breadcrumb-item");
    expect(item).toBeInTheDocument();
    expect(item.tagName.toLowerCase()).toBe("li");
    expect(item.className).toContain("inline-flex");
    expect(item.className).toContain("items-center");
});

it("renders BreadcrumbLink component as an anchor by default", () => {
    render(<BreadcrumbLink data-testid="breadcrumb-link" href="#">Link</BreadcrumbLink>);
    const link = screen.getByTestId("breadcrumb-link");
    expect(link).toBeInTheDocument();
    expect(link.tagName.toLowerCase()).toBe("a");
    expect(link).toHaveAttribute("href", "#");
});

it("renders BreadcrumbLink with custom element when asChild is true", () => {
    render(
        <BreadcrumbLink asChild>
            <button data-testid="breadcrumb-button">Button Link</button>
        </BreadcrumbLink>
    );
    const buttonLink = screen.getByTestId("breadcrumb-button");
    expect(buttonLink).toBeInTheDocument();
    expect(buttonLink.tagName.toLowerCase()).toBe("button");
});

it("renders BreadcrumbPage component with correct attributes", () => {
    render(<BreadcrumbPage data-testid="breadcrumb-page">Current Page</BreadcrumbPage>);
    const page = screen.getByTestId("breadcrumb-page");
    expect(page).toBeInTheDocument();
    expect(page.tagName.toLowerCase()).toBe("span");
    expect(page).toHaveAttribute("aria-current", "page");
    expect(page).toHaveAttribute("aria-disabled", "true");
    expect(page.className).toContain("text-foreground");
});

it("renders BreadcrumbSeparator component with default chevron", () => {
    render(<BreadcrumbSeparator data-testid="breadcrumb-separator" />);
    const separator = screen.getByTestId("breadcrumb-separator");
    expect(separator).toBeInTheDocument();
    expect(separator.tagName.toLowerCase()).toBe("li");
    expect(separator).toHaveAttribute("role", "presentation");
    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator.querySelector("svg")).toBeInTheDocument();
});

it("renders BreadcrumbSeparator with custom children", () => {
    render(
        <BreadcrumbSeparator data-testid="breadcrumb-separator">
            <span data-testid="custom-separator">/</span>
        </BreadcrumbSeparator>
    );
    const separator = screen.getByTestId("breadcrumb-separator");
    const customSeparator = screen.getByTestId("custom-separator");
    expect(customSeparator).toBeInTheDocument();
    expect(customSeparator.textContent).toBe("/");
});

it("renders BreadcrumbEllipsis component correctly", () => {
    render(<BreadcrumbEllipsis data-testid="breadcrumb-ellipsis" />);
    const ellipsis = screen.getByTestId("breadcrumb-ellipsis");
    expect(ellipsis).toBeInTheDocument();
    expect(ellipsis.tagName.toLowerCase()).toBe("span");
    expect(ellipsis).toHaveAttribute("role", "presentation");
    expect(ellipsis).toHaveAttribute("aria-hidden", "true");
    expect(ellipsis.className).toContain("flex");
    expect(screen.getByText("More")).toHaveClass("sr-only");
});

it("renders a complete breadcrumb navigation", () => {
    render(
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Current</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
    
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(document.querySelectorAll('li[role="presentation"]').length).toBe(2);
});
});