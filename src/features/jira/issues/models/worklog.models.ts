/**
 * Worklog Domain Models
 *
 * Types specific to JIRA worklog operations and time tracking
 */

import type {
  ADFDocument,
  ADFNode,
} from "@features/jira/shared/parsers/adf.parser";
import type { User } from "@features/jira/users/models";

/**
 * Worklog entry
 */
export interface WorklogEntry {
  self?: string;
  author?: User;
  updateAuthor?: User;
  comment?: ADFDocument | ADFNode | string;
  created?: string;
  updated?: string;
  visibility?: {
    type: string;
    value: string;
  };
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  id?: string;
  issueId?: string;
}
