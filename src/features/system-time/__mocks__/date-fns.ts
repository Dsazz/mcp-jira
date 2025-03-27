/**
 * Mock for date-fns module
 * This file is automatically used when calling jest.mock('date-fns')
 */

import { jest } from '@jest/globals';

// Export all the functions that are used in the project
export const format = jest.fn().mockImplementation((date, formatString, options) => {
  return `Formatted: ${formatString}`;
});

// Add other date-fns functions as needed
export const isBefore = jest.fn();
export const isAfter = jest.fn();
export const differenceInDays = jest.fn();
// etc. 