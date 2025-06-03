/**
 * JIRA Configuration Module
 *
 * Provides configuration management for JIRA client
 */

// Re-export types and schema
export {
  jiraConfigSchema,
  type JiraClientConfig,
  type ValidationResult,
} from "./jira-config.schema";

// Re-export default configuration
export { defaultJiraConfig, loadEnvConfig } from "./jira-config.defaults";

// Re-export validation functions
export {
  validateJiraConfig,
  validateConfigSafe,
} from "./jira-config.validator";

// Re-export configuration service
export { JiraConfigService } from "./jira-config.service";

// For backward compatibility
export { JiraConfigService as JiraConfig } from "./jira-config.service";
