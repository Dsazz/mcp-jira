/**
 * Board types for the JIRA boards domain
 */

/**
 * Board type enum
 */
export enum BoardType {
  SCRUM = "scrum",
  KANBAN = "kanban",
  SIMPLE = "simple"
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
