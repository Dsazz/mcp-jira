/**
 * User test utilities
 */
import type { McpResponse } from "@core/responses";
import type { User } from "@features/jira/users/models/user.models";

/**
 * Creates a standard user profile test response
 */
export function createUserResponse(user: User): McpResponse<User> {
  return {
    success: true,
    data: user,
  };
}

/**
 * Creates a standard current user test response
 */
export function createCurrentUserResponse(user: User): McpResponse<User> {
  return {
    success: true,
    data: user,
  };
}

/**
 * Creates a standard user error response
 */
export function createUserErrorResponse(message: string): McpResponse<unknown> {
  return {
    success: false,
    error: message,
  };
}
