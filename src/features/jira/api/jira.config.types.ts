import { formatZodError } from "@core/utils/validation";
/**
 * JIRA API Configuration
 *
 * Contains configuration for JIRA API
 */
import { z } from "zod";

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
 * JIRA client configuration type
 */
export type JiraClientConfig = z.infer<typeof jiraConfigSchema>;

/**
 * Default JIRA configuration values
 * Values are loaded from environment variables when available
 */
export const defaultJiraConfig = {
  hostUrl: process.env.JIRA_HOST || "",
  username: process.env.JIRA_USERNAME || "",
  apiToken: process.env.JIRA_API_TOKEN || "",
  maxRetries: Number.parseInt(process.env.JIRA_MAX_RETRIES || "3", 10),
  timeout: Number.parseInt(process.env.JIRA_TIMEOUT || "10000", 10),
};

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
  constructor(config?: Partial<JiraClientConfig>) {
    if (config) {
      this.config = { ...defaultJiraConfig, ...config } as JiraClientConfig;
    } else {
      this.config = defaultJiraConfig as JiraClientConfig;
    }
  }

  /**
   * Create a configuration from environment variables
   *
   * @returns New JiraConfig instance
   */
  static fromEnv(): JiraConfig {
    // Read environment variables at call time, not module load time
    const envConfig = {
      hostUrl: process.env.JIRA_HOST || "",
      username: process.env.JIRA_USERNAME || "",
      apiToken: process.env.JIRA_API_TOKEN || "",
      maxRetries: Number.parseInt(process.env.JIRA_MAX_RETRIES || "3", 10),
      timeout: Number.parseInt(process.env.JIRA_TIMEOUT || "10000", 10),
    };
    return new JiraConfig(envConfig);
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

/**
 * Validates JIRA configuration
 *
 * @param config - Configuration to validate
 * @returns Validated configuration
 * @throws Error if configuration is invalid
 */
export function validateJiraConfig(
  config: Partial<JiraClientConfig> = {},
): JiraClientConfig {
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
