/**
 * Zod validation utilities for MCP
 */
import { z } from 'zod';

/**
 * Validate data against a zod schema
 * 
 * @param schema - The zod schema to validate against
 * @param data - The data to validate
 * @param errorPrefix - Optional prefix for error messages
 * @returns The validated data (with inferred type)
 * @throws Error if validation fails
 */
export function validate<T extends z.ZodType<any, any>>(
  schema: T,
  data: unknown,
  errorPrefix = 'Validation error'
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod validation errors
      const formattedErrors = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
        
      throw new Error(`${errorPrefix}: ${formattedErrors}`);
    }
    throw error;
  }
}

/**
 * Check if data is valid according to schema (without throwing)
 */
export function isValid<T>(schema: z.ZodType<T>, data: unknown): boolean {
  return schema.safeParse(data).success;
} 