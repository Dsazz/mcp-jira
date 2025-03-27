/**
 * Environment variable configuration and types
 */

/**
 * Typed environment variables used in the application
 */
export interface EnvVars {
  JIRA_HOST?: string;
  JIRA_USERNAME?: string;
  JIRA_API_TOKEN?: string;
  NODE_ENV?: string;
}

/**
 * Get typed environment variables
 */
export function getEnvVars(): EnvVars {
  return process.env as EnvVars;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}
