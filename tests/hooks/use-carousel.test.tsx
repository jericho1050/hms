import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react"; // Updated import
import { useCarousel } from "../../hooks/use-carousel";
import { CarouselContext } from "@/contexts/carousel-context";

describe("useCarousel", () => {
    const dummyCarouselValue = { 
        currentSlide: 0, 
        totalSlides: 5, 
        goToSlide: (index: number) => {},
        carouselRef: () => {},
        api: undefined,
        scrollPrev: () => {},
        scrollNext: () => {},
        canScrollPrev: false,
        canScrollNext: false
    };

    it("returns the carousel context when used within a provider", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <CarouselContext.Provider value={dummyCarouselValue}>
                {children}
            </CarouselContext.Provider>
        );
        const { result } = renderHook(() => useCarousel(), { wrapper });
        expect(result.current).toEqual(dummyCarouselValue);
    });

    it("throws error when used outside of a CarouselContext provider", () => {
        // Modern way of testing thrown errors with renderHook
        expect(() => {
            renderHook(() => useCarousel());
        }).toThrow("useCarousel must be used within a <Carousel />");
    });
});