/**
 * Core validation functions
 */
import { z } from 'zod';
import { ValidationError } from '../errors/api-errors';

/**
 * Validate data against a schema, throwing ValidationError on failure
 */
export function validate<T>(
  schema: z.ZodType<T>, 
  data: unknown, 
  errorMessage: string = 'Validation failed'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('; ');
      
      throw new ValidationError(`${errorMessage}: ${details}`);
    }
    
    throw new ValidationError(errorMessage);
  }
}

/**
 * Check if data is valid according to schema (without throwing)
 */
export function isValid<T>(schema: z.ZodType<T>, data: unknown): boolean {
  return schema.safeParse(data).success;
} 