/**
 * System Time configuration
 */
import { FeatureConfig } from '../../../shared/config/feature-config.interface';

/**
 * Configuration for the System Time feature
 */
export class SystemTimeConfig implements FeatureConfig {
  /**
   * Feature name
   */
  readonly name = 'SystemTime';
  
  /**
   * Default date format
   */
  readonly defaultDateFormat: string;
  
  /**
   * Create a new SystemTimeConfig
   */
  constructor(defaultDateFormat = 'yyyy-MM-dd HH:mm:ss') {
    this.defaultDateFormat = defaultDateFormat;
  }
  
  /**
   * Check if configuration is valid
   * For system-time, config is always valid as there are no external dependencies
   */
  isValid(): boolean {
    return true;
  }
  
  /**
   * Get diagnostic information
   */
  getDiagnostics(): Record<string, unknown> {
    return {
      defaultDateFormat: this.defaultDateFormat
    };
  }
} 