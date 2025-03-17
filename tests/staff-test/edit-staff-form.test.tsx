import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditStaffForm } from "../../components/staff/edit-staff-form";
import { Staff } from "@/types/staff";
import * as toast from "@/hooks/use-toast";

// Mock the useToast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

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
}));

describe("EditStaffForm", () => {
  // Test data
  const mockStaff: Staff = {
    id: "123",
    firstName: "John",
    lastName: "Doe",
    role: "Doctor",
    department: "Cardiology",
    email: "john.doe@hospital.com",
    phone: "1234567890",
    address: "123 Main St",
    joiningDate: "2023-01-01",
    status: "active",
    licenseNumber: "MD12345",
    specialty: "Heart Surgery",
    qualification: "MD",
    availability: {
      recurring: {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" },
        saturday: { start: "09:00", end: "17:00" },
        sunday: { start: "09:00", end: "17:00" },
      },
      overrides: {},
    },
  };

  const onCloseMock = vi.fn();
  const onSubmitMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with staff data", () => {
    render(
      <EditStaffForm
        staff={mockStaff}
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    );

    // Title
    expect(screen.getByText("Edit Staff")).toBeInTheDocument();

    // Check for default values using getByDisplayValue
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john.doe@hospital.com")).toBeInTheDocument();
  });

  it("switches between tabs correctly", async () => {
    const user = userEvent.setup();
    render(
      <EditStaffForm
        staff={mockStaff}
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    );

    // Click on employment tab
    await user.click(screen.getByRole("tab", { name: /employment/i }));

    // Check if "Joining Date" field is displayed
    // Instead of getByLabelText, confirm the value we expect for the date
    expect(screen.getByDisplayValue("2023-01-01")).toBeInTheDocument();

    // Click on professional tab
    await user.click(screen.getByRole("tab", { name: /professional/i }));

    // Check if professional fields are visible
    expect(screen.getByDisplayValue("MD")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Heart Surgery")).toBeInTheDocument();
    expect(screen.getByDisplayValue("MD12345")).toBeInTheDocument();
  });

  it("closes the dialog when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <EditStaffForm
        staff={mockStaff}
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("submits the form with updated data", async () => {
    const spyToast = vi.spyOn(toast, "useToast").mockReturnValue({
      toast: vi.fn(),
      dismiss: vi.fn(),
      toasts: [],
    });

    const user = userEvent.setup();
    render(
      <EditStaffForm
        staff={mockStaff}
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    );

    // Update first name from "John" to "Jane"
    const firstNameInput = screen.getByDisplayValue("John");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    // Switch to employment tab (if you need to select a role, do it here)
    await user.click(screen.getByRole("tab", { name: /employment/i }));

    // Click save changes
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockStaff,
          firstName: "Jane",
        })
      );
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it("validates form inputs", async () => {
    const user = userEvent.setup();
    render(
      <EditStaffForm
        staff={mockStaff}
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    );

    // Clear the first name
    const firstNameInput = screen.getByDisplayValue("John");
    await user.clear(firstNameInput);

    // Attempt to submit
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Confirm validation error
    await waitFor(() => {
      expect(
        screen.getByText("First name must be at least 2 characters")
      ).toBeInTheDocument();
    });

    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it("updates local staff when prop changes", async () => {
    const { rerender } = render(
      <EditStaffForm
        staff={mockStaff}
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    );

    // Initial check
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();

    const updatedStaff = {
      ...mockStaff,
      firstName: "Jane",
    };

    // Rerender with updated staff prop
    rerender(
      <EditStaffForm
        staff={updatedStaff}
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    );

    // Confirm it updated
    await waitFor(() => {
      expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
    });
  });
});