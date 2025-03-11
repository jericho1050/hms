import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatCurrency(value: number, maximumFractionDigits: number = 0): string {
  // Ensure maximumFractionDigits is within the valid range (0-20)
  const validMaxFractionDigits = Math.min(Math.max(0, maximumFractionDigits), 20);
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: validMaxFractionDigits,
  }).format(value);
}