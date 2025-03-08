import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "../../components/ui/switch";
import "@testing-library/jest-dom";

describe("Switch component", () => {
    it("renders correctly", () => {
        render(<Switch />);
        expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("is unchecked by default", () => {
        render(<Switch />);
        expect(screen.getByRole("switch")).toHaveAttribute("data-state", "unchecked");
    });

    it("changes state when clicked", async () => {
        const user = userEvent.setup();
        render(<Switch />);
        
        const switchElement = screen.getByRole("switch");
        expect(switchElement).toHaveAttribute("data-state", "unchecked");
        
        await user.click(switchElement);
        expect(switchElement).toHaveAttribute("data-state", "checked");
    });

    it("calls onChange handler when clicked", async () => {
        const user = userEvent.setup();
        const onChangeMock = vi.fn();
        
        render(<Switch onCheckedChange={onChangeMock} />);
        await user.click(screen.getByRole("switch"));
        
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(true);
    });

    it("can be disabled", () => {
        render(<Switch disabled />);
        expect(screen.getByRole("switch")).toBeDisabled();
    });

    it("applies custom className", () => {
        const customClass = "test-class";
        render(<Switch className={customClass} />);
        expect(screen.getByRole("switch")).toHaveClass(customClass);
    });
});