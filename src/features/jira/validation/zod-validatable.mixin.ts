/**
 * Mixin to add Zod validation capabilities to tools
 */
import { z } from 'zod';
import { ValidationError } from '../errors/api-errors';

/**
 * Constructor type for mixin application
 */
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Mixin that adds Zod validation capabilities to a class
 * This allows tools to validate their parameters before execution
 */
export function ZodValidatable<TBase extends Constructor, TParams>(
  Base: TBase,
  schema: z.ZodType<TParams>
) {
  return class Validatable extends Base {
    /**
     * Validate parameters against the Zod schema
     */
    public validateParams(params: unknown): TParams {
      try {
        return schema.parse(params);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
          throw new ValidationError(`Invalid parameters: ${errorMessage}`);
        }
        throw error;
      }
    }
  };
} 