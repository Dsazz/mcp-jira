/**
 * Common validation schemas used across multiple tools
 */
import { z } from 'zod';

/**
 * Schema for validating JIRA issue keys
 * Ensures keys follow the PROJECT-NUMBER format (e.g., PD-123)
 */
export const issueKeySchema = z.string()
  .regex(
    /^[A-Z]+-\d+$/, 
    'Issue key must be in the format PROJECT-NUMBER (e.g., PD-123)'
  )
  .describe('The JIRA issue key (e.g., PD-312)');

/**
 * Type for validated issue keys
 */
export type IssueKey = z.infer<typeof issueKeySchema>; 