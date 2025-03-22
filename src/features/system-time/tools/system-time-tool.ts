/**
 * System Time specific tool base class
 */
import { BaseTool } from '../../../shared/tools/base-tool';
import { SystemTimeConfig } from '../config/system-time-config';

/**
 * Base tool class for System Time tools
 * Provides common functionality specific to System Time feature
 */
export abstract class SystemTimeTool<TParams = unknown, TResult = unknown> 
extends BaseTool<TParams, TResult> {
  /**
   * Create a new SystemTimeTool
   */
  constructor(
    toolName: string,
    config: SystemTimeConfig
  ) {
    super('SystemTime', toolName, config);
  }
  
  /**
   * Get the typed System Time configuration
   */
  protected getConfig(): SystemTimeConfig {
    return this.config as SystemTimeConfig;
  }
} 