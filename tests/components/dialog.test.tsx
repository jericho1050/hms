import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const ControlledDialog = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger data-testid="dialog-trigger">Open Dialog</DialogTrigger>
      <DialogContent data-testid="dialog-content">
        <DialogHeader data-testid="dialog-header">
          <DialogTitle data-testid="dialog-title">Dialog Title</DialogTitle>
          <DialogDescription data-testid="dialog-description">
            Dialog Description
          </DialogDescription>
        </DialogHeader>
        <div data-testid="dialog-body">Dialog Content</div>
        <DialogFooter data-testid="dialog-footer">
          <DialogClose data-testid="dialog-close">Close Dialog</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

describe("Dialog Components", () => {
  it("should open when trigger is clicked and close when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<ControlledDialog />);
    
    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
    
    await user.click(screen.getByTestId("dialog-trigger"));
    expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    
    await user.click(screen.getByTestId("dialog-close"));
    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
  });

  describe("DialogHeader", () => {
    it("renders with correct classes", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader data-testid="header">Header Content</DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const header = screen.getByTestId("header");
      expect(header).toBeInTheDocument();
      expect(header.textContent).toBe("Header Content");
      expect(header.className).toContain("flex");
      expect(header.className).toContain("flex-col");
    });

    it("applies custom className", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader className="test-class" data-testid="header">
              Header
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByTestId("header")).toHaveClass("test-class");
    });
  });

  describe("DialogFooter", () => {
    it("renders with correct classes", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogFooter data-testid="footer">Footer Content</DialogFooter>
          </DialogContent>
        </Dialog>
      );
      const footer = screen.getByTestId("footer");
      expect(footer).toBeInTheDocument();
      expect(footer.textContent).toBe("Footer Content");
      expect(footer.className).toContain("flex");
      expect(footer.className).toContain("flex-col-reverse");
    });

    it("applies custom className", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogFooter className="test-class" data-testid="footer">
              Footer
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByTestId("footer")).toHaveClass("test-class");
    });
  });

  describe("DialogTitle", () => {
    it("renders with correct classes", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle data-testid="title">Test Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      const title = screen.getByTestId("title");
      expect(title).toBeInTheDocument();
      expect(title.textContent).toBe("Test Title");
      expect(title.className).toContain("text-lg");
      expect(title.className).toContain("font-semibold");
    });
  });

  describe("DialogDescription", () => {
    it("renders with correct classes", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogDescription data-testid="desc">
              Test Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );
      const desc = screen.getByTestId("desc");
      expect(desc).toBeInTheDocument();
      expect(desc.textContent).toBe("Test Description");
      expect(desc.className).toContain("text-sm");
      expect(desc.className).toContain("text-muted-foreground");
    });
  });
});