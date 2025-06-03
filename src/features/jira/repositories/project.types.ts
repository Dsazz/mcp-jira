/**
 * Project Domain Types
 *
 * Types specific to JIRA project operations and data structures
 */

import type { User } from "./user.models";

/**
 * JIRA Project representation
 */
export interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  lead?: User;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  properties?: Record<string, unknown>;
  entityId?: string;
  uuid?: string;
  projectCategory?: {
    id: string;
    name: string;
    description?: string;
  };
  issueTypes?: Array<{
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    subtask: boolean;
  }>;
  versions?: Array<{
    id: string;
    name: string;
    released: boolean;
    archived: boolean;
  }>;
  components?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

/**
 * Project permissions
 */
export interface ProjectPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canAdminister: boolean;
  canBrowse: boolean;
  permissions?: {
    CREATE_ISSUES?: {
      havePermission: boolean;
    };
    EDIT_ISSUES?: {
      havePermission: boolean;
    };
    DELETE_ISSUES?: {
      havePermission: boolean;
    };
    [key: string]:
      | {
          havePermission: boolean;
        }
      | undefined;
  };
}

/**
 * Get projects options
 */
export interface GetProjectsOptions {
  expand?: string[];
  recent?: number;
  properties?: string[];
  maxResults?: number;
  startAt?: number;
  typeKey?: string;
  categoryId?: number;
  searchQuery?: string;
  orderBy?: string;
}
