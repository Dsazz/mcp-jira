/**
 * Date Formatter
 * Provides utilities for formatting dates using date-fns
 */
import { format } from 'date-fns';
import { Locale } from 'date-fns';

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
  /**
   * Format string in date-fns format
   * @default 'yyyy-MM-dd HH:mm:ss'
   */
  format?: string;
  
  /**
   * Date to format
   * @default current date
   */
  date?: Date;

  /**
   * Locale for formatting
   * Import from date-fns/locale (e.g., import { enUS } from 'date-fns/locale')
   */
  locale?: Locale;
}

/**
 * Handles date formatting using date-fns
 */
export class DateFormatter {
  /**
   * Format a date according to provided options
   * 
   * @param options Formatting options
   * @returns Formatted date string
   * @throws Error if formatting fails
   */
  public format(options: DateFormatOptions = {}): string {
    try {
      const formatString = options.format || 'yyyy-MM-dd HH:mm:ss';
      const date = options.date || new Date();
      
      // Return the result from date-fns format function with optional locale
      if (options.locale) {
        return format(date, formatString, { locale: options.locale });
      }
      
      return format(date, formatString);
    } catch (error) {
      // Handle errors during formatting
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to format date: ${errorMessage}`);
    }
  }
} 