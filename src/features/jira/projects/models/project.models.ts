/**
 * Project models for the JIRA projects domain
 */

/**
 * Options for retrieving projects
 */
export interface GetProjectsOptions {
  startAt?: number;
  maxResults?: number;
  orderBy?: string;
  query?: string;
  typeKey?: string;
  categoryId?: number;
  searchBy?: string;
  searchQuery?: string;
  recent?: number;
  expand?: string[];
  properties?: string[];
}

/**
 * Generic paginated response structure from JIRA API
 */
export interface PaginatedResponse<T> {
  self: string;
  nextPage?: string;
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: T[];
}

/**
 * Project search response from JIRA API
 */
export interface ProjectSearchResponse extends PaginatedResponse<Project> {}

/**
 * Project types for the JIRA projects domain
 */

import type { User } from "../../users/models";

/**
 * Project type enum
 */
export enum ProjectType {
  SOFTWARE = "software",
  BUSINESS = "business",
  SERVICE_DESK = "service_desk",
}

/**
 * Project style enum
 */
export enum ProjectStyle {
  NEXT_GEN = "next-gen",
  CLASSIC = "classic",
}

/**
 * Project entity representing a JIRA project
 */
export interface Project {
  id: string;
  key: string;
  name: string;
  self?: string;
  description?: string;
  lead?: User;
  isPrivate?: boolean;
  style?: string;
  projectTypeKey?: string;
  simplified?: boolean;
  components?: Array<{ id: string; name: string }>;
  versions?: Array<{
    id: string;
    name: string;
    released?: boolean;
    archived?: boolean;
  }>;
  issueTypes?: Array<{
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    subtask?: boolean;
  }>;
  projectCategory?: {
    id: string;
    name: string;
    description?: string;
  };
  avatarUrls?: Record<string, string>;
}

/**
 * Project category structure
 */
export interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
}

/**
 * Project permissions response from JIRA API
 */
export interface ProjectPermissions {
  permissions?: {
    CREATE_ISSUES?: { havePermission: boolean };
    EDIT_ISSUES?: { havePermission: boolean };
    DELETE_ISSUES?: { havePermission: boolean };
    [key: string]: { havePermission: boolean } | undefined;
  };
}
