/**
 * JIRA Configuration Service
 *
 * Configuration service for JIRA client
 */
import { loadEnvConfig } from "./jira-config.defaults";
import type { JiraClientConfig, ValidationResult } from "./jira-config.schema";
import { validateConfigSafe } from "./jira-config.validator";

/**
 * JIRA Configuration class
 *
 * Handles configuration creation and validation for JIRA clients
 */
export class JiraConfigService {
  private config: JiraClientConfig;

  /**
   * Create a new JIRA configuration
   *
   * @param config Configuration object or null to load from environment
   */
  constructor(config?: Partial<JiraClientConfig>) {
    if (config) {
      this.config = { ...loadEnvConfig(), ...config } as JiraClientConfig;
    } else {
      this.config = loadEnvConfig() as JiraClientConfig;
    }
  }

  /**
   * Create a configuration from environment variables
   *
   * @returns New JiraConfigService instance
   */
  static fromEnv(): JiraConfigService {
    return new JiraConfigService(loadEnvConfig());
  }

  /**
   * Get the configuration object
   */
  get(): JiraClientConfig {
    return this.config;
  }

  /**
   * Validate the configuration
   *
   * @returns Validation result
   */
  validate(): ValidationResult {
    const result = validateConfigSafe(this.config);

    if (result.valid) {
      // Apply any transformations back to the config if needed
      const validatedConfig = validateConfigSafe(this.config);
      if (validatedConfig.valid && "data" in validatedConfig) {
        this.config = validatedConfig.data as JiraClientConfig;
      }
    }

    return result;
  }
}
