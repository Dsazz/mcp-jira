/**
 * JIRA configuration management
 */
import { z } from 'zod';
import { logger } from '../../../shared/logger';

// Configuration schema
const configSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  apiToken: z.string().min(1, 'API token is required'),
  host: z.string().url('Host must be a valid URL')
});

// Configuration type
export type JiraConfig = z.infer<typeof configSchema>;

// Environment variable keys
const ENV_VARS = {
  USERNAME: 'JIRA_USERNAME',
  API_TOKEN: 'JIRA_API_TOKEN',
  HOST: 'JIRA_HOST'
};

/**
 * Get JIRA configuration from environment variables
 */
export function getConfig(): JiraConfig {
  const config = {
    username: process.env[ENV_VARS.USERNAME],
    apiToken: process.env[ENV_VARS.API_TOKEN],
    host: process.env[ENV_VARS.HOST]
  };

  try {
    return configSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.issues
        .map(issue => issue.path.join('.'))
        .join(', ');
      throw new Error(`Invalid JIRA configuration. Missing or invalid fields: ${missingFields}`);
    }
    throw error;
  }
}

/**
 * Check if JIRA configuration is valid
 */
export function validateConfig(throwOnError: boolean = false): boolean {
  try {
    getConfig();
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    
    logger.warn(message, { prefix: 'JIRA', isMcp: true });
    
    if (throwOnError) {
      throw error;
    }
    
    return false;
  }
}

/**
 * Helper to log current configuration status
 */
export function logConfigStatus(): void {
  logger.debug({
    JIRA_USERNAME: process.env[ENV_VARS.USERNAME] ? '(set)' : '(not set)',
    JIRA_API_TOKEN: process.env[ENV_VARS.API_TOKEN] ? '(set)' : '(not set)',
    JIRA_HOST: process.env[ENV_VARS.HOST] || '(not set)'
  }, { prefix: 'JIRA Config', isMcp: true });
} 