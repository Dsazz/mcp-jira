/**
 * JIRA Configuration Utilities
 *
 * Utilities for managing JIRA API configuration
 */
import { z } from "zod";

/**
 * Schema for validating JIRA configuration
 */
export const jiraConfigSchema = z.object({
  /** URL of the JIRA server */
  baseUrl: z.string().url("JIRA base URL must be a valid URL"),

  /** API token or password for authentication */
  apiToken: z.string().min(1, "API token is required"),

  /** Username for authentication */
  username: z.string().min(1, "Username is required"),

  /** Maximum number of retries for failed requests */
  maxRetries: z.number().int().nonnegative().default(3),

  /** Timeout in milliseconds for requests */
  timeout: z.number().int().positive().default(10000),
});

/**
 * Type for JIRA configuration
 */
export type JiraConfig = z.infer<typeof jiraConfigSchema>;

/**
 * Default JIRA configuration
 * Values are loaded from environment variables when available
 */
export const defaultJiraConfig: JiraConfig = {
  baseUrl: process.env.JIRA_BASE_URL || "",
  apiToken: process.env.JIRA_API_TOKEN || "",
  username: process.env.JIRA_USERNAME || "",
  maxRetries: Number.parseInt(process.env.JIRA_MAX_RETRIES || "3", 10),
  timeout: Number.parseInt(process.env.JIRA_TIMEOUT || "10000", 10),
};

/**
 * Validates JIRA configuration
 *
 * @param config - Configuration to validate
 * @returns Validated configuration
 * @throws Error if configuration is invalid
 */
export function validateJiraConfig(
  config: Partial<JiraConfig> = {},
): JiraConfig {
  const mergedConfig = {
    ...defaultJiraConfig,
    ...config,
  };

  try {
    return jiraConfigSchema.parse(mergedConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new Error(`Invalid JIRA configuration: ${errorMessages}`);
    }
    throw error;
  }
}
