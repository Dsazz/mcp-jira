/**
 * Mock implementation of SystemTimeConfig
 * This file is automatically used when calling jest.mock('../../config/system-time-config')
 */

import { jest } from '@jest/globals';

export class SystemTimeConfig {
  readonly name = 'SystemTime';
  readonly defaultDateFormat: string;
  
  constructor(defaultDateFormat = 'yyyy-MM-dd HH:mm:ss') {
    this.defaultDateFormat = defaultDateFormat;
  }
  
  isValid = jest.fn().mockReturnValue(true);
  
  getDiagnostics = jest.fn().mockImplementation(() => {
    return {
      defaultDateFormat: this.defaultDateFormat
    };
  });
} 