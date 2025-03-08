import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot, 
  InputOTPSeparator 
} from "@/components/ui/input-otp";

// Mock the dependencies
vi.mock("input-otp", () => ({
  OTPInput: ({ children, className, containerClassName, ...props }: { 
    children?: React.ReactNode; 
    className?: string; 
    containerClassName?: string; 
    [key: string]: any 
  }) => (
    <div data-testid="otp-input" className={className} {...props}>
      <div className={containerClassName}>{children}</div>
    </div>
  ),
  OTPInputContext: {
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Consumer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
}));

// Mock the context for InputOTPSlot
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useContext: () => ({
      slots: [
        { char: "1", hasFakeCaret: false, isActive: false },
        { char: "2", hasFakeCaret: true, isActive: true },
        { char: "3", hasFakeCaret: false, isActive: false },
      ]
    })
  };
});

vi.mock("lucide-react", () => ({
  Dot: () => <div data-testid="dot-icon">•</div>
}));

describe("InputOTP Components", () => {
  it("has correct display names", () => {
    expect(InputOTP.displayName).toBe("InputOTP");
  });

  describe("InputOTP", () => {
    it("renders with proper classes", () => {
      const { getByTestId } = render(
        <InputOTP className="test-class" maxLength={4}>
          <InputOTPGroup />
        </InputOTP>
      );
      expect(getByTestId("otp-input")).toHaveClass("test-class");
    });

    it("applies container class names", () => {
      const { container } = render(
        <InputOTP containerClassName="container-class" maxLength={4}>
          <InputOTPGroup />
        </InputOTP>
      );
      expect(container.querySelector(".container-class")).toBeTruthy();
    });
  });

  describe("InputOTPGroup", () => {
    it("renders with default classes", () => {
      const { container } = render(<InputOTPGroup />);
      expect(container.firstChild).toHaveClass("flex", "items-center");
    });

    it("forwards additional classes", () => {
      const { container } = render(<InputOTPGroup className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("InputOTPSlot", () => {
    it("renders with provided index", () => {
      const { container } = render(<InputOTPSlot index={1} />);
      expect(container.firstChild).toBeTruthy();
      // Testing active state for index 1 (which is active in our mock)
      expect(container.firstChild).toHaveClass("ring-2");
    });
  });

  describe("InputOTPSeparator", () => {
    it("renders with separator role", () => {
      const { container } = render(<InputOTPSeparator />);
      expect(container.firstChild).toHaveAttribute("role", "separator");
    });

    it("contains a dot icon", () => {
      const { getByTestId } = render(<InputOTPSeparator />);
      expect(getByTestId("dot-icon")).toBeTruthy();
    });
  });
});