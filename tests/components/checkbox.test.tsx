import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "@/components/ui/checkbox";


describe("Checkbox", () => {
    it("renders properly", () => {
        render(<Checkbox />);
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(<Checkbox className="test-class" />);
        expect(screen.getByRole("checkbox")).toHaveClass("test-class");
    });

    it("forwards props to the underlying checkbox", () => {
        const onCheckedChange = vi.fn();
        render(<Checkbox onCheckedChange={onCheckedChange} />);
        
        fireEvent.click(screen.getByRole("checkbox"));
        expect(onCheckedChange).toHaveBeenCalledTimes(1);
    });

    it("renders as checked when checked prop is true", () => {
        render(<Checkbox checked />);
        expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "checked");
    });

    it("renders as unchecked when checked prop is false", () => {
        render(<Checkbox checked={false} />);
        expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "unchecked");
    });

    it("can be disabled", () => {
        render(<Checkbox disabled />);
        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("displays the check icon when checked", () => {
        render(<Checkbox checked />);
        expect(screen.getByRole("checkbox").querySelector("svg")).toBeInTheDocument();
    });

    it("doesn't display the check icon when unchecked", () => {
        render(<Checkbox checked={false} />);
        const checkbox = screen.getByRole("checkbox");
        // The icon should not be visible in unchecked state,
        // but it might still be in the DOM with visibility changes
        expect(checkbox.querySelector("svg")?.closest('[data-state="unchecked"]')).toBeFalsy();
    });
});