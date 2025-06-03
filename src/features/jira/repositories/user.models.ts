/**
 * User Domain Models
 *
 * Core data structures for JIRA user domain objects
 */

/**
 * JIRA user representation
 */
export interface User {
  displayName: string | null;
  emailAddress?: string | null;
  accountId: string;
  avatarUrls?: {
    [key: string]: string;
  } | null;
}
