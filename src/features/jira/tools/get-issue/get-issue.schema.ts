/**
 * Schema definitions for GetIssueTool
 */
import { z } from 'zod';
import { issueKeySchema } from '../../validation/common-schemas';

/**
 * Parameter schema for GetIssueTool
 * Defines the structure and validation rules for tool parameters
 */
export const getIssueParamsSchema = z.object({
  issueKey: issueKeySchema
}); 