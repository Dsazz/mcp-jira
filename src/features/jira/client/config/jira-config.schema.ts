/**
 * JIRA Configuration Schema
 *
 * Zod schema definitions for JIRA client configuration validation
 */
import { z } from "zod";

/**
 * JIRA client configuration schema
 */
export const jiraConfigSchema = z.object({
  /**
   * JIRA instance host URL
   */
  hostUrl: z
    .string()
    .url("JIRA host URL must be a valid URL")
    .nonempty("JIRA host URL is required")
    .transform((url) => (url.endsWith("/") ? url : `${url}/`)),

  /**
   * Username for JIRA authentication
   */
  username: z.string().nonempty("JIRA username is required"),

  /**
   * API token for JIRA authentication
   */
  apiToken: z.string().nonempty("JIRA API token is required"),

  /**
   * Maximum number of retries for failed requests
   */
  maxRetries: z.number().int().nonnegative().default(3),

  /**
   * Timeout in milliseconds for requests
   */
  timeout: z.number().int().positive().default(10000),
});

/**
 * JIRA client configuration type inferred from the schema
 */
export type JiraClientConfig = z.infer<typeof jiraConfigSchema>;

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: JiraClientConfig;
}
