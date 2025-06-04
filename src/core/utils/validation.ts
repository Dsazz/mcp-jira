/**
 * Validation Utilities
 *
 * Common validation functions and utilities
 */
import type { z } from "zod";

/**
 * Format a Zod error into a string
 *
 * @param error - Zod error to format
 * @returns Formatted error string
 */
export const formatZodError = (error: z.ZodError): string => {
  return error.errors
    .map((err) => {
      const path = err.path.join(".");
      return `${path ? `${path}: ` : ""}${err.message}`;
    })
    .join(", ");
};
