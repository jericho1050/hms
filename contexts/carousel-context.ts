import { CarouselContextProps } from './../types/carousel';
import { createContext } from "react";

export const CarouselContext = createContext<CarouselContextProps | null>(null);