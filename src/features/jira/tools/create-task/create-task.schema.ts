/**
 * Schema definitions for CreateTaskTool
 */
import { z } from 'zod';
import { issueKeySchema } from '../../validation/common-schemas';

/**
 * Parameter schema for CreateTaskTool
 * Defines the structure and validation rules for tool parameters
 */
export const createTaskParamsSchema = z.object({
  issueKey: issueKeySchema
}); 