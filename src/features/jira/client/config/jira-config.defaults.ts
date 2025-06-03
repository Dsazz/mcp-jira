/**
 * JIRA Configuration Defaults
 *
 * Default configuration values for JIRA client
 */
import type { JiraClientConfig } from "./jira-config.schema";

/**
 * Default JIRA configuration values
 * Values are loaded from environment variables when available
 */
export const defaultJiraConfig: Partial<JiraClientConfig> = {
  hostUrl: process.env.JIRA_HOST || "",
  username: process.env.JIRA_USERNAME || "",
  apiToken: process.env.JIRA_API_TOKEN || "",
  maxRetries: Number.parseInt(process.env.JIRA_MAX_RETRIES || "3", 10),
  timeout: Number.parseInt(process.env.JIRA_TIMEOUT || "10000", 10),
};

/**
 * Loads the latest environment values for JIRA configuration
 *
 * @returns Configuration object with values from environment variables
 */
export function loadEnvConfig(): Partial<JiraClientConfig> {
  return {
    hostUrl: process.env.JIRA_HOST || "",
    username: process.env.JIRA_USERNAME || "",
    apiToken: process.env.JIRA_API_TOKEN || "",
    maxRetries: Number.parseInt(process.env.JIRA_MAX_RETRIES || "3", 10),
    timeout: Number.parseInt(process.env.JIRA_TIMEOUT || "10000", 10),
  };
}
