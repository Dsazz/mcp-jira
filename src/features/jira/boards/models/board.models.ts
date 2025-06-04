/**
 * Board models for the JIRA boards domain
 */

/**
 * Board information
 */
export interface Board {
  id: string;
  name: string;
  type: string;
  self: string;
  location?: {
    projectId: string;
    displayName: string;
    projectName: string;
    projectKey: string;
    projectTypeKey: string;
    avatarURI: string;
    name: string;
  };
  filterId?: string;
}

/**
 * Options for retrieving boards
 */
export interface GetBoardsOptions {
  startAt?: number;
  maxResults?: number;
  type?: string;
  name?: string;
  projectKeyOrId?: string;
}
