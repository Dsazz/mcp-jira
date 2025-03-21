/**
 * Issue-specific validation functions
 */
import { validate, isValid } from './validator';
import { issueKeySchema } from './common-schemas';
import { ValidationError } from '../errors/api-errors';

/**
 * Validate an issue key format
 * @throws ValidationError if invalid
 */
export function validateIssueKey(issueKey: string): void {
  try {
    validate(
      issueKeySchema, 
      issueKey, 
      'Invalid issue key format'
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new ValidationError(error.message);
    }
    throw new ValidationError('Invalid issue key');
  }
}

/**
 * Check if an issue key is valid (without throwing)
 */
export function isValidIssueKey(issueKey: string): boolean {
  return isValid(issueKeySchema, issueKey);
} 