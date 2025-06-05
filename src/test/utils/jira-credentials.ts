/**
 * Utility functions for JIRA credentials validation in tests
 */

/**
 * Checks if real JIRA credentials are available for integration testing.
 * Excludes fallback/example values that would cause tests to run with invalid credentials.
 *
 * @returns true if real JIRA credentials are available, false otherwise
 */
export function hasJiraCredentials(): boolean {
  return !!(
    process.env.JIRA_HOST &&
    process.env.JIRA_USERNAME &&
    process.env.JIRA_API_TOKEN &&
    process.env.JIRA_HOST !== "https://example.atlassian.net" &&
    process.env.JIRA_USERNAME !== "test@example.com" &&
    process.env.JIRA_API_TOKEN !== "test-token"
  );
}

/**
 * Gets the reason why JIRA credentials are not available (for test skip messages)
 *
 * @returns string describing why credentials are not available
 */
export function getJiraCredentialsSkipReason(): string {
  if (!process.env.JIRA_HOST) {
    return "JIRA_HOST environment variable not set";
  }
  if (!process.env.JIRA_USERNAME) {
    return "JIRA_USERNAME environment variable not set";
  }
  if (!process.env.JIRA_API_TOKEN) {
    return "JIRA_API_TOKEN environment variable not set";
  }
  if (process.env.JIRA_HOST === "https://example.atlassian.net") {
    return "JIRA_HOST is set to example value";
  }
  if (process.env.JIRA_USERNAME === "test@example.com") {
    return "JIRA_USERNAME is set to example value";
  }
  if (process.env.JIRA_API_TOKEN === "test-token") {
    return "JIRA_API_TOKEN is set to example value";
  }
  return "Unknown reason";
}
