/**
 * FeatureConfig - Interface for MCP feature configuration
 */

/**
 * Common interface for feature configurations
 */
export interface FeatureConfig {
  /**
   * Name of the feature
   */
  readonly name: string;
  
  /**
   * Check if the configuration is valid
   */
  isValid(): boolean;
  
  /**
   * Get diagnostic information about the configuration
   * Safe to expose - should not include sensitive info
   */
  getDiagnostics(): Record<string, unknown>;
} 