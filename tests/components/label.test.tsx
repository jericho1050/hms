import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";
import * as React from "react";

describe("Label", () => {
    it("renders correctly", () => {
        render(<Label>Test Label</Label>);
        expect(screen.getByText("Test Label")).toBeTruthy();
    });

    it("applies default classes", () => {
        const { container } = render(<Label>Test Label</Label>);
        const label = container.firstChild as Element;
        
        expect(label.className).toContain("text-sm");
        expect(label.className).toContain("font-medium");
        expect(label.className).toContain("leading-none");
    });

    it("applies custom classes", () => {
        const { container } = render(<Label className="test-class">Test Label</Label>);
        const label = container.firstChild as Element;
        
        expect(label.className).toContain("test-class");
    });

    it("forwards additional props", () => {
        render(<Label htmlFor="test-input">Test Label</Label>);
        const label = screen.getByText("Test Label");
        
        expect(label.getAttribute("for")).toBe("test-input");
    });

    it("has correct displayName", () => {
        expect(Label.displayName).toBeTruthy();
    });
});