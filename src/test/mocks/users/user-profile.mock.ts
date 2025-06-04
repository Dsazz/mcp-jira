/**
 * User Profile Mock Data
 * Provides mock user profiles for testing various scenarios
 */

import type { User } from "@features/jira/users/models/user.models";

/**
 * Base user profile for testing
 */
export const mockUser: User = {
  self: "https://test-jira.atlassian.net/rest/api/3/user?accountId=123456789",
  accountId: "123456789",
  accountType: "atlassian",
  displayName: "John Doe",
  emailAddress: "john.doe@example.com",
  avatarUrls: {
    "48x48":
      "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/48x48.png",
    "24x24":
      "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/24x24.png",
    "16x16":
      "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/16x16.png",
    "32x32":
      "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/32x32.png",
  },
  active: true,
  timeZone: "America/New_York",
};

/**
 * Admin user profile
 */
export const mockAdminUser: User = {
  ...mockUser,
  accountId: "admin123456789",
  displayName: "Admin User",
  emailAddress: "admin@example.com",
  timeZone: "UTC",
};

/**
 * Inactive user profile
 */
export const mockInactiveUser: User = {
  ...mockUser,
  accountId: "inactive123456789",
  displayName: "Inactive User",
  emailAddress: "inactive@example.com",
  active: false,
};

/**
 * User with minimal data
 */
export const mockMinimalUser: User = {
  self: "https://test-jira.atlassian.net/rest/api/3/user?accountId=minimal123",
  accountId: "minimal123",
  accountType: "atlassian",
  displayName: "Minimal User",
  active: true,
  timeZone: "UTC",
};

/**
 * User with different timezone
 */
export const mockUserDifferentTimezone: User = {
  ...mockUser,
  accountId: "timezone123456789",
  displayName: "European User",
  emailAddress: "european@example.com",
  timeZone: "Europe/London",
};

/**
 * User factory for creating custom profiles
 */
export const userMockFactory = {
  /**
   * Create a user profile with custom properties
   */
  createUser(overrides: Partial<User> = {}): User {
    return {
      ...mockUser,
      ...overrides,
    };
  },

  /**
   * Create user with specific account ID
   */
  createUserWithAccountId(accountId: string): User {
    return {
      ...mockUser,
      accountId,
      self: `https://test-jira.atlassian.net/rest/api/3/user?accountId=${accountId}`,
    };
  },

  /**
   * Create user with specific display name
   */
  createUserWithDisplayName(displayName: string): User {
    return {
      ...mockUser,
      displayName,
    };
  },

  /**
   * Create user with specific timezone
   */
  createUserWithTimezone(timeZone: string): User {
    return {
      ...mockUser,
      timeZone,
    };
  },

  /**
   * Create user with specific active status
   */
  createUserWithActiveStatus(active: boolean): User {
    return {
      ...mockUser,
      active,
    };
  },
};
