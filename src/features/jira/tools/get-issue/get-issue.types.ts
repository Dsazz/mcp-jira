/**
 * Type definitions for GetIssueTool
 */
import { z } from 'zod';
import { getIssueParamsSchema } from './get-issue.schema';

/**
 * Type for GetIssueTool parameters
 * Generated from the Zod schema to ensure type safety
 */
export type GetIssueParams = z.infer<typeof getIssueParamsSchema>; 