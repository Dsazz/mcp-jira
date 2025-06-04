/**
 * Board models and types for the JIRA boards domain
 */

/**
 * Board type enum
 */
export enum BoardType {
  SCRUM = "scrum",
  KANBAN = "kanban",
  SIMPLE = "simple",
}

/**
 * Board location type
 */
export interface BoardLocation {
  projectId?: string | number;
  displayName?: string;
  projectName?: string;
  projectKey?: string;
  projectTypeKey?: string;
  avatarURI?: string;
  name?: string;
}

/**
 * Board admin information
 */
export interface BoardAdmins {
  users?: Array<{
    displayName: string;
    accountId: string;
  }>;
  groups?: Array<{
    name: string;
    groupId: string;
  }>;
}

/**
 * Board information (unified API model)
 */
export interface Board {
  id: string;
  name: string;
  type: string;
  self: string;
  location?: BoardLocation;
  filterId?: string;
  favourite?: boolean;
  isPrivate?: boolean;
  canEdit?: boolean;
  admins?: BoardAdmins;
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
  accountIdLocation?: string;
  projectLocation?: string;
  includePrivate?: boolean;
  negateLocationFiltering?: boolean;
  orderBy?: string;
  expand?: string;
  filterId?: string;
}

/**
 * Board configuration interface
 */
export interface BoardConfiguration {
  id: string;
  name: string;
  type: string;
  self: string;
  location?: BoardLocation;
  filterId?: string;
}
