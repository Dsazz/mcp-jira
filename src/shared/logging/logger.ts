/**
 * Simple unified logger for MCP
 */

// Basic types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogOptions {
  prefix?: string;
}

/**
 * Core unified logger implementation
 */
export class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  /**
   * Create a child logger with a specified context
   */
  withContext(context: string): Logger {
    return new Logger(context);
  }

  private formatMessage(message: string, level: LogLevel, options: LogOptions = {}): string {
    const timestamp = new Date().toISOString();
    let prefix = options.prefix || '';
    
    // Add the context to the prefix if one exists
    if (this.context) {
      prefix = prefix ? `${this.context}:${prefix}` : this.context;
    }
    
    const parts = [timestamp, `[${level.toUpperCase()}]`];
    
    if (prefix) {
      parts.push(`[${prefix}]`);
    }
    
    parts.push(message);
    return parts.join(' ');
  }

  private write(message: string, level: LogLevel, options: LogOptions = {}): void {
    process.stderr.write(this.formatMessage(message, level, options) + '\n');
  }

  /**
   * Log debug level messages
   */
  debug(message: string | object, options: LogOptions = {}): void {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
      this.write(formattedMessage, 'debug', options);
    }
  }

  /**
   * Log info level messages
   */
  info(message: string | object, options: LogOptions = {}): void {
    const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    this.write(formattedMessage, 'info', options);
  }

  /**
   * Log warning level messages
   */
  warn(message: string | object, options: LogOptions = {}): void {
    const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    this.write(formattedMessage, 'warn', options);
  }

  /**
   * Log error level messages
   */
  error(message: string | Error | object, options: LogOptions = {}): void {
    let formattedMessage: string;
    if (message instanceof Error) {
      formattedMessage = message.stack || message.message;
    } else if (typeof message === 'string') {
      formattedMessage = message;
    } else {
      formattedMessage = JSON.stringify(message, null, 2);
    }
    this.write(formattedMessage, 'error', options);
  }
} 