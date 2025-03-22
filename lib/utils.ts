import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Staff } from "@/types/staff";
import {format} from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, maximumFractionDigits: number = 2): string {
  // Ensure maximumFractionDigits is within the valid range (0-20)
  const validMaxFractionDigits = Math.min(Math.max(0, maximumFractionDigits), 20);
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: validMaxFractionDigits,
  }).format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy');
}

export const getShiftForDate = (staff: Staff, date: Date) => {
  // Check if there's an override for this specific date
  const dateString = format(date, "yyyy-MM-dd");
  if (staff.availability?.overrides?.[dateString]) {
    return staff.availability.overrides[dateString];
  }
  
  // Otherwise use the recurring schedule
  const dayName = format(date, "EEEE").toLowerCase() as keyof typeof staff.availability.recurring;
  return staff.availability?.recurring?.[dayName] || "off";
};

// Helper function to calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
