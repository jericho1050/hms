import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

describe("Accordion", () => {
    it("renders accordion components correctly", () => {
        render(
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Accordion Item 1</AccordionTrigger>
                    <AccordionContent>Accordion Content 1</AccordionContent>
                </AccordionItem>
            </Accordion>
        );
        expect(screen.getByText("Accordion Item 1")).toBeInTheDocument();
        // Use { hidden: true } to find content that's rendered but not visible
        expect(screen.queryByText("Accordion Content 1")).toBeInTheDocument();
    });

    it("expands and collapses when clicked", async () => {
        const user = userEvent.setup();
        render(
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Accordion Item 1</AccordionTrigger>
                    <AccordionContent>Accordion Content 1</AccordionContent>
                </AccordionItem>
            </Accordion>
        );
        
        const trigger = screen.getByText("Accordion Item 1");
        // Query hidden content so we can access its parent node
        const content = screen.queryByText("Accordion Content 1")?.parentElement as HTMLElement;
        
        // Content should start in collapsed state
        expect(content.getAttribute("data-state")).toBe("closed");
        
        // Click to expand
        await user.click(trigger);
        expect(content.getAttribute("data-state")).toBe("open");
        
        // Click again to collapse
        await user.click(trigger);
        expect(content.getAttribute("data-state")).toBe("closed");
    });

    it("displays multiple items correctly", () => {
        render(
            <Accordion type="multiple">
                <AccordionItem value="item-1">
                    <AccordionTrigger>Item 1</AccordionTrigger>
                    <AccordionContent>Content 1</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Item 2</AccordionTrigger>
                    <AccordionContent>Content 2</AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.queryByText("Content 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
        expect(screen.queryByText("Content 2")).toBeInTheDocument();
    });
});