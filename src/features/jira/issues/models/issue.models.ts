/**
 * Issue Domain Models and Types
 *
 * Core data structures for JIRA issue domain objects, transitions, and updates
 */

import type {
  ADFDocument,
  ADFNode,
} from "@features/jira/shared/parsers/adf.parser";
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

/**
 * Issue transition
 */
export interface Transition {
  id: string;
  name: string;
  to: {
    self: string;
    description: string;
    iconUrl: string;
    name: string;
    id: string;
    statusCategory: {
      self: string;
      id: number;
      key: string;
      colorName: string;
      name: string;
    };
  };
  hasScreen: boolean;
  isGlobal: boolean;
  isInitial: boolean;
  isAvailable: boolean;
  isConditional: boolean;
  fields?: Record<string, unknown>;
  expand?: string;
}

/**
 * Issue update request
 */
export interface IssueUpdateRequest {
  fields?: Record<string, unknown>;
  update?: Record<
    string,
    Array<{ set?: unknown; add?: unknown; remove?: unknown }>
  >;
  notifyUsers?: boolean;
  historyMetadata?: {
    type?: string;
    description?: string;
    descriptionKey?: string;
    activityDescription?: string;
    activityDescriptionKey?: string;
    emailDescription?: string;
    emailDescriptionKey?: string;
    actor?: {
      id?: string;
      displayName?: string;
      type?: string;
      avatarUrl?: string;
      url?: string;
    };
    generator?: {
      id?: string;
      type?: string;
    };
    cause?: {
      id?: string;
      type?: string;
    };
    extraData?: Record<string, string>;
  };
  properties?: Array<{
    key: string;
    value: unknown;
  }>;
}
