import { SidebarContextType } from './../types/sidebar';
import { createContext } from "react";

export const SidebarContext = createContext<SidebarContextType | null>(null)