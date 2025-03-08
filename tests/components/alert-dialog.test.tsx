import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

describe("AlertDialog", () => {
  it("renders trigger and opens dialog on click", async () => {
    const user = userEvent.setup();

    const AlertDialogDemo = () => (
      <AlertDialog>
        <AlertDialogTrigger data-testid="trigger">Open Dialog</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    render(<AlertDialogDemo />);

    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(
      screen.getByText("This action cannot be undone.")
    ).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("closes dialog when Cancel button is clicked", async () => {
    const user = userEvent.setup();

    const AlertDialogDemo = () => (
      <AlertDialog>
        <AlertDialogTrigger data-testid="trigger">Open Dialog</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dialog Title</AlertDialogTitle>
            <AlertDialogDescription>Dialog description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    render(<AlertDialogDemo />);

    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByText("Dialog Title")).toBeInTheDocument();

    await user.click(screen.getByTestId("cancel"));

    // Since the dialog is removed from the DOM when closed, we expect the title to no longer be present.
    expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
  });

  it("applies custom className to components", () => {
    render(
      <AlertDialog>
        <AlertDialogContent className="test-content-class">
          <AlertDialogHeader className="test-header-class">
            <AlertDialogTitle className="test-title-class">Title</AlertDialogTitle>
            <AlertDialogDescription className="test-desc-class">
              Description
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="test-footer-class">
            <AlertDialogCancel className="test-cancel-class">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="test-action-class">
              Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    // The dialog is closed by default so it shouldn't be visible.
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("passes props correctly to underlying components", () => {
    const onAction = vi.fn();
    const onCancel = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogContent data-testid="content">
          <AlertDialogHeader>
            <AlertDialogTitle>Test Title</AlertDialogTitle>
            <AlertDialogDescription>Test description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={onAction} data-testid="action">
            Action
          </AlertDialogAction>
          <AlertDialogCancel onClick={onCancel} data-testid="cancel">
            Cancel
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );

    // The dialog is closed by default, so the content should not be in the document.
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });
});