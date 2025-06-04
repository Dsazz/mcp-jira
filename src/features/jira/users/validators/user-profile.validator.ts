/**
 * User profile validator
 */
import { JiraIssueValidationError } from "@features/jira/shared/validators/errors";
import type { GetUsersOptions } from "@features/jira/users/models/user.models";

/**
 * Interface for validating user profile operations
 */
export interface UserProfileValidator {
  /**
   * Validate get users options
   */
  validateGetUsers(options?: GetUsersOptions): void;
  
  /**
   * Validate get user profile parameters
   */
  validateGetUserProfile(accountId: string): void;
}

/**
 * Implementation of the user profile validator
 */
export class UserProfileValidatorImpl implements UserProfileValidator {
  /**
   * Validate get users options
   */
  validateGetUsers(options?: GetUsersOptions): void {
    if (!options) {
      return; // No options is valid for get all users
    }

    if (options.query !== undefined && typeof options.query !== "string") {
      throw new JiraIssueValidationError("query must be a string");
    }

    if (options.startAt !== undefined && (typeof options.startAt !== "number" || options.startAt < 0)) {
      throw new JiraIssueValidationError("startAt must be a non-negative number");
    }

    if (options.maxResults !== undefined && (typeof options.maxResults !== "number" || options.maxResults <= 0)) {
      throw new JiraIssueValidationError("maxResults must be a positive number");
    }

    if (options.includeInactive !== undefined && typeof options.includeInactive !== "boolean") {
      throw new JiraIssueValidationError("includeInactive must be a boolean");
    }
  }

  /**
   * Validate get user profile parameters
   */
  validateGetUserProfile(accountId: string): void {
    if (!accountId) {
      throw new JiraIssueValidationError("Account ID is required");
    }

    if (typeof accountId !== "string") {
      throw new JiraIssueValidationError("Account ID must be a string");
    }
  }
} 