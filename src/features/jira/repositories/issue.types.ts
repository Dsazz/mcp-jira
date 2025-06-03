/**
 * Issue Domain Types
 *
 * Types specific to JIRA issue operations, transitions, and updates
 */

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
