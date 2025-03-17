import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StaffAvailability } from "../../components/staff/staff-availability"

// Mock hooks or data as needed
vi.mock("@/hooks/use-toast", () => ({
    useToast: () => ({ toast: vi.fn() }),
}))
vi.mock("@/hooks/use-staff", () => ({
    useStaffData: () => ({
        staffData: [
            {
                id: "1",
                firstName: "John",
                lastName: "Doe",
                role: "Nurse",
                status: "Active",
                availability: { recurring: { monday: "morning", tuesday: "off" } },
            },
        ],
        handleStaffUpdate: vi.fn(),
    }),
}))

describe("StaffAvailability extra tests", () => {
    // Helper to extract the date range text from calendar navigation
    const getDateRangeText = () => {
        return screen.getByText(/-/).textContent
    }

    describe("StaffAvailability", () => {

        it("navigates to the next week when the next button is clicked", async () => {
            render(<StaffAvailability />)
            const initialDateRange = getDateRangeText()
            // Assuming the third button (index 2) is the next week button
            const navButtons = screen.getAllByRole("button")
            await userEvent.click(navButtons[2])
            const updatedDateRange = getDateRangeText()
            // Expect the date range to have changed
            expect(updatedDateRange).not.toEqual(initialDateRange)
        })

        it("navigates to the previous week when the previous button is clicked", async () => {
            render(<StaffAvailability />)
            const initialDateRange = getDateRangeText()
            // The first button (index 0) is the previous week button
            const navButtons = screen.getAllByRole("button")
            await userEvent.click(navButtons[0])
            const updatedDateRange = getDateRangeText()
            expect(updatedDateRange).not.toEqual(initialDateRange)
        })

        it("resets to the current week when the 'This Week' button is clicked", async () => {
            render(<StaffAvailability />)
            const initialDateRange = getDateRangeText()
            const navButtons = screen.getAllByRole("button")
            // Click next week to change the week
            await userEvent.click(navButtons[2])
            const changedDateRange = getDateRangeText()
            expect(changedDateRange).not.toEqual(initialDateRange)
            // Click the "This Week" button (button with text "This Week")
            const thisWeekButton = screen.getByRole("button", { name: /This Week/i })
            await userEvent.click(thisWeekButton)
            const resetDateRange = getDateRangeText()
            expect(resetDateRange).toEqual(initialDateRange)
        })
    })
})