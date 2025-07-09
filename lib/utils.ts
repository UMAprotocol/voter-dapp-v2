import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Strip invalid characters that Discord strips from titles
export function stripInvalidCharacters(str: string): string {
  const invalidCharacters = [
    "\u202f", // hyphenation point
  ];
  let sanitized = str;
  for (const char of invalidCharacters) {
    sanitized = sanitized.replace(new RegExp(char, "g"), "");
  }
  return sanitized;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
