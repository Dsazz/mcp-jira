/**
 * Board Domain Types
 *
 * Types specific to JIRA board operations and data structures
 */

import type { User } from "./user.models";

/**
 * JIRA Board representation
 */
export interface Board {
  id: number;
  self: string;
  name: string;
  type: string;
  admins?: {
    users?: User[];
    groups?: Array<{ name: string }>;
  };
  location?: {
    projectId?: number;
    projectKey?: string;
    projectName?: string;
    displayName?: string;
    projectTypeKey?: string;
    avatarURI?: string;
    name?: string;
  };
  canEdit?: boolean;
  isPrivate?: boolean;
  favourite?: boolean;
}

/**
 * Board configuration
 */
export interface BoardConfiguration {
  id: number;
  name: string;
  type: string;
  self: string;
  location: {
    type: string;
    key: string;
    id: string;
    name: string;
  };
  filter: {
    id: string;
    self: string;
  };
  subQuery?: {
    query: string;
  };
  columnConfig: {
    columns: Array<{
      name: string;
      statuses: Array<{
        id: string;
        self: string;
      }>;
    }>;
    constraintType: string;
  };
  estimation?: {
    type: string;
    field: {
      fieldId: string;
      displayName: string;
    };
  };
  ranking: {
    rankCustomFieldId: number;
  };
}

/**
 * Get boards options
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
  filterId?: number;
}
