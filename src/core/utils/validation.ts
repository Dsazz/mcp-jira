/**
 * Validation Utilities
 *
 * Utilities for validating data using Zod schemas
 */
import { z } from "zod";
import { ValidationError } from "../errors";

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

/**
 * Validate data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param errorMessage - Optional custom error message
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown,
  errorMessage = "Validation failed",
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = formatZodError(error);
      throw new ValidationError(`${errorMessage}: ${formattedErrors}`, {
        zodErrors: error.errors,
      });
    }
    throw new ValidationError(
      `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Safely validate data against a Zod schema
 * Returns a result object instead of throwing
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Result object with success status, data, and error
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const formattedErrors = formatZodError(result.error);
  return { success: false, error: formattedErrors };
}
