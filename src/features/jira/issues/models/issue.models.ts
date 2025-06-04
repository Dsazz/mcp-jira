/**
 * Issue Domain Models
 *
 * Core data structures for JIRA issue domain objects
 */

import type { ADFDocument, ADFNode } from "@features/jira/shared/parsers/adf.parser";
import type { User } from "@features/jira/users/models";

/**
 * Basic JIRA issue representation
 */
export interface Issue {
  id: string;
  key: string;
  self: string | null;
  fields?: IssueFields | null;
}

/**
 * Issue fields structure
 */
export interface IssueFields {
  summary?: string | null;
  description?: ADFDocument | ADFNode | string | null;
  issuetype?: {
    name: string | null;
    iconUrl?: string | null;
  } | null;
  status?: {
    name: string | null;
    statusCategory?: {
      name: string | null;
      colorName: string | null;
    };
  } | null;
  priority?: {
    name: string | null;
    iconUrl?: string | null;
  } | null;
  assignee?: User | null;
  reporter?: User | null;
  created?: string | null;
  updated?: string | null;
  labels?: string[] | null;
  [key: string]: unknown;
}
