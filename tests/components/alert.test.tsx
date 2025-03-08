import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import React from "react";

describe("Alert", () => {
    it("renders with default variant", () => {
        render(<Alert>Test alert</Alert>);
        const alert = screen.getByRole("alert");
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveClass("bg-background");
        expect(alert).toHaveClass("text-foreground");
    });

    it("renders with destructive variant", () => {
        render(<Alert variant="destructive">Destructive alert</Alert>);
        const alert = screen.getByRole("alert");
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveClass("border-destructive/50");
        expect(alert).toHaveClass("text-destructive");
    });

    it("applies custom className", () => {
        render(<Alert className="test-class">Alert with custom class</Alert>);
        const alert = screen.getByRole("alert");
        expect(alert).toHaveClass("test-class");
    });

    it("forwards ref correctly", () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<Alert ref={ref}>Alert with ref</Alert>);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
});

describe("AlertTitle", () => {
    it("renders correctly", () => {
        render(<AlertTitle>Important Notice</AlertTitle>);
        expect(screen.getByText("Important Notice")).toBeInTheDocument();
        expect(screen.getByText("Important Notice").tagName).toBe("H5");
    });

    it("applies custom className", () => {
        render(<AlertTitle className="test-title-class">Title</AlertTitle>);
        expect(screen.getByText("Title")).toHaveClass("test-title-class");
    });
});

describe("AlertDescription", () => {
    it("renders correctly", () => {
        render(<AlertDescription>This is a description</AlertDescription>);
        expect(screen.getByText("This is a description")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(<AlertDescription className="test-desc-class">Description</AlertDescription>);
        expect(screen.getByText("Description")).toHaveClass("test-desc-class");
    });
});