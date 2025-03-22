/**
 * Mock implementation of DateFormatter
 * This file is automatically used when calling jest.mock('../../formatters/date.formatter')
 */

import { jest } from '@jest/globals';

// Create a shared mock format function that's easily accessible in tests
export const formatMock = jest.fn().mockReturnValue('2023-01-01 12:00:00');

export interface DateFormatOptions {
  date?: Date;
  format?: string;
}

export class DateFormatter {
  // Use the shared mock
  format = formatMock;
  
  constructor() {
    // Ensure mock is reset for each new instance
    formatMock.mockClear();
  }
} 