/**
 * JIRA API Configuration
 *
 * Contains configuration for JIRA API
 */
import { z } from "zod";
import { formatZodError } from "@core/utils/validation";

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

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
});

/**
 * JIRA client configuration type
 */
export type JiraClientConfig = z.infer<typeof jiraConfigSchema>;

/**
 * JIRA Configuration class
 *
 * Handles configuration creation and validation for JIRA clients
 */
export class JiraConfig {
  private config: JiraClientConfig;

  /**
   * Create a new JIRA configuration
   *
   * @param config Configuration object or null to load from environment
   */
  constructor(config?: JiraClientConfig) {
    if (config) {
      this.config = config;
    } else {
      this.config = {
        hostUrl: process.env.JIRA_HOST || "",
        username: process.env.JIRA_USERNAME || "",
        apiToken: process.env.JIRA_API_TOKEN || "",
      };
    }
  }

  /**
   * Create a configuration from environment variables
   *
   * @returns New JiraConfig instance
   */
  static fromEnv(): JiraConfig {
    return new JiraConfig();
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
    const result = jiraConfigSchema.safeParse(this.config);

    if (result.success) {
      // Apply the transformed values back to the config
      this.config = result.data;
      return { valid: true, errors: [] };
    }

    return {
      valid: false,
      errors: result.error.errors.map((err) =>
        formatZodError(new z.ZodError([err])),
      ),
    };
  }
}
