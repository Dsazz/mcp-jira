/**
 * Schema definitions for GetTimeTool
 */
import { z } from 'zod';

/**
 * Parameter schema for GetTimeTool
 * Defines the structure and validation rules for tool parameters
 */
export const getTimeParamsSchema = z.object({
  format: z.string()
    .optional()
    .describe('Date format string following date-fns format')
}); 