/**
 * Mock zod validation module for testing
 */
import { z } from 'zod';

// Mock validate function
export const validate = jest.fn().mockImplementation((schema, data, errorPrefix = 'Validation error') => {
  // Check if params has issueKey when testing with empty parameters
  if (schema.safeParse(data).success === false) {
    throw new Error(`${errorPrefix}`);
  }
  return data;
});

// Mock isValid function
export const isValid = jest.fn().mockImplementation((schema, data) => {
  return schema.safeParse(data).success;
});

// Helper functions for testing
export const resetAllMocks = () => {
  (validate as jest.Mock).mockReset();
  (validate as jest.Mock).mockImplementation((schema, data, errorPrefix = 'Validation error') => {
    if (schema.safeParse(data).success === false) {
      throw new Error(`${errorPrefix}`);
    }
    return data;
  });
  
  (isValid as jest.Mock).mockReset();
  (isValid as jest.Mock).mockImplementation((schema, data) => {
    return schema.safeParse(data).success;
  });
}; 