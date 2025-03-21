/**
 * Type definitions for CreateTaskTool
 */
import { z } from 'zod';
import { createTaskParamsSchema } from './create-task.schema';

/**
 * Type for CreateTaskTool parameters
 * Generated from the Zod schema to ensure type safety
 */
export type CreateTaskParams = z.infer<typeof createTaskParamsSchema>; 