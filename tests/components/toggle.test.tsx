import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Toggle } from "../../components/ui/toggle"

describe("Toggle component", () => {
    it("renders without crashing", () => {
        render(<Toggle>Toggle</Toggle>)
        expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("applies provided variant and size classes", () => {
        const { container } = render(
            <Toggle variant="outline" size="lg">
                Toggle
            </Toggle>
        )
        const button = container.querySelector("button")
        expect(button?.className).toContain("border")
        // Additional class assertions can be added as needed.
    })

    it("forwards events and handles click events", async () => {
        const onClick = vi.fn()
        render(<Toggle onClick={onClick}>Toggle</Toggle>)
        const button = screen.getByRole("button")
        await userEvent.click(button)
        expect(onClick).toHaveBeenCalled()
    })
})