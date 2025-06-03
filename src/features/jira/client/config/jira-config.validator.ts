/**
 * JIRA Configuration Validator
 *
 * Validation functions for JIRA client configuration
 */
import { formatZodError } from "@core/utils/validation";
import { z } from "zod";
import { JiraConfigError } from "../errors";
import { defaultJiraConfig } from "./jira-config.defaults";
import {
  type JiraClientConfig,
  type ValidationResult,
  jiraConfigSchema,
} from "./jira-config.schema";

/**
 * Validates JIRA configuration
 *
 * @param config - Configuration to validate
 * @returns Validated configuration
 * @throws JiraConfigError if configuration is invalid
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
      throw new JiraConfigError(
        `Invalid JIRA configuration: ${errorMessages}`,
        error,
      );
    }
    throw error;
  }
}

/**
 * Validates a configuration without throwing
 *
 * @param config - Configuration to validate
 * @returns Validation result with errors if any and validated data if successful
 */
export function validateConfigSafe(
  config: Partial<JiraClientConfig> = {},
): ValidationResult & { data?: JiraClientConfig } {
  const mergedConfig = {
    ...defaultJiraConfig,
    ...config,
  };

  const result = jiraConfigSchema.safeParse(mergedConfig);

  if (result.success) {
    return { valid: true, errors: [], data: result.data };
  }

  return {
    valid: false,
    errors: result.error.errors.map((err) =>
      formatZodError(new z.ZodError([err])),
    ),
  };
}
