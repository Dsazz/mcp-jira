/**
 * Logger utility for MCP server
 * Uses stderr for all logging to ensure visibility in MCP server logs
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  timestamp?: boolean;
  prefix?: string;
  isMcp?: boolean;
}

class Logger {
  private static instance: Logger;
  private readonly defaultOptions: LogOptions = {
    level: 'info',
    timestamp: true,
    prefix: '',
    isMcp: false
  };

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(message: string, options: LogOptions = {}): string {
    const { level, timestamp, prefix, isMcp } = { ...this.defaultOptions, ...options };
    
    if (isMcp) {
      // Format as JSON-RPC notification for MCP protocol
      return JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/log',
        params: {
          level: level || 'info',
          message: prefix ? `[${prefix}] ${message}` : message
        }
      });
    }

    // Regular logging format
    const parts: string[] = [];

    if (timestamp) {
      parts.push(new Date().toISOString());
    }

    if (level) {
      parts.push(`[${level.toUpperCase()}]`);
    }

    if (prefix) {
      parts.push(`[${prefix}]`);
    }

    parts.push(message);
    return parts.join(' ');
  }

  private write(message: string, options: LogOptions = {}): void {
    process.stderr.write(this.formatMessage(message, options) + '\n');
  }

  debug(message: string | object, options: Omit<LogOptions, 'level'> = {}): void {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
      this.write(formattedMessage, { ...options, level: 'debug' });
    }
  }

  info(message: string | object, options: Omit<LogOptions, 'level'> = {}): void {
    const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    this.write(formattedMessage, { ...options, level: 'info' });
  }

  warn(message: string | object, options: Omit<LogOptions, 'level'> = {}): void {
    const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    this.write(formattedMessage, { ...options, level: 'warn' });
  }

  error(message: string | Error | object, options: Omit<LogOptions, 'level'> = {}): void {
    let formattedMessage: string;
    if (message instanceof Error) {
      formattedMessage = message.stack || message.message;
    } else if (typeof message === 'string') {
      formattedMessage = message;
    } else {
      formattedMessage = JSON.stringify(message, null, 2);
    }
    this.write(formattedMessage, { ...options, level: 'error' });
  }
}

export const logger = Logger.getInstance(); 