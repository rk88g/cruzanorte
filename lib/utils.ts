import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isInternationalWhatsappNumber(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value);
}
