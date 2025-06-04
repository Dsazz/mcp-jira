/**
 * User Domain Models
 *
 * Core data structures for JIRA user domain objects
 */

/**
 * User models for the JIRA users domain
 */

/**
 * User information
 */
export interface User {
  accountId: string;
  displayName: string | null;
  active?: boolean;
  accountType?: string;
  avatarUrls?: Record<string, string>;
  emailAddress?: string;
  timeZone?: string;
  self?: string;
}

/**
 * User details with extended information
 */
export interface UserDetails extends User {
  locale?: string;
  groups?: {
    size: number;
    items: Array<{
      name: string;
      self: string;
    }>;
  };
  applicationRoles?: {
    size: number;
    items: Array<{
      key: string;
      name: string;
      self: string;
    }>;
  };
  expand?: string;
}

/**
 * Options for retrieving users
 */
export interface GetUsersOptions {
  query?: string;
  startAt?: number;
  maxResults?: number;
  includeInactive?: boolean;
}
