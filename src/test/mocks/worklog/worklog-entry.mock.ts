/**
 * Worklog Entry Mock Data
 * Provides mock worklog entries for testing various scenarios
 */

import type { WorklogEntry } from "@features/jira/issues/models/worklog.models";

/**
 * Base worklog entry for testing
 */
export const mockWorklogEntry: WorklogEntry = {
  self: "https://test-jira.atlassian.net/rest/api/3/issue/TEST-123/worklog/10001",
  author: {
    self: "https://test-jira.atlassian.net/rest/api/3/user?accountId=123456789",
    accountId: "123456789",
    displayName: "John Doe",
    emailAddress: "john.doe@example.com",
    avatarUrls: {
      "48x48":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/48x48.png",
      "24x24":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/24x24.png",
      "16x16":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/16x16.png",
      "32x32":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/32x32.png",
    },
    active: true,
    timeZone: "America/New_York",
  },
  updateAuthor: {
    self: "https://test-jira.atlassian.net/rest/api/3/user?accountId=123456789",
    accountId: "123456789",
    displayName: "John Doe",
    emailAddress: "john.doe@example.com",
    avatarUrls: {
      "48x48":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/48x48.png",
      "24x24":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/24x24.png",
      "16x16":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/16x16.png",
      "32x32":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/32x32.png",
    },
    active: true,
    timeZone: "America/New_York",
  },
  comment: {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Worked on implementing new feature",
          },
        ],
      },
    ],
  },
  created: "2024-01-15T09:00:00.000+0000",
  updated: "2024-01-15T09:00:00.000+0000",
  started: "2024-01-15T09:00:00.000+0000",
  timeSpent: "2h",
  timeSpentSeconds: 7200,
  id: "10001",
  issueId: "10123",
};

/**
 * Worklog entry with minimal data
 */
export const mockMinimalWorklogEntry: WorklogEntry = {
  self: "https://test-jira.atlassian.net/rest/api/3/issue/TEST-123/worklog/10002",
  author: {
    self: "https://test-jira.atlassian.net/rest/api/3/user?accountId=123456789",
    accountId: "123456789",
    displayName: "John Doe",
    emailAddress: "john.doe@example.com",
    avatarUrls: {
      "48x48":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/48x48.png",
      "24x24":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/24x24.png",
      "16x16":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/16x16.png",
      "32x32":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/32x32.png",
    },
    active: true,
    timeZone: "America/New_York",
  },
  updateAuthor: {
    self: "https://test-jira.atlassian.net/rest/api/3/user?accountId=123456789",
    accountId: "123456789",
    displayName: "John Doe",
    emailAddress: "john.doe@example.com",
    avatarUrls: {
      "48x48":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/48x48.png",
      "24x24":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/24x24.png",
      "16x16":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/16x16.png",
      "32x32":
        "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/123456789/32x32.png",
    },
    active: true,
    timeZone: "America/New_York",
  },
  created: "2024-01-15T10:00:00.000+0000",
  updated: "2024-01-15T10:00:00.000+0000",
  started: "2024-01-15T10:00:00.000+0000",
  timeSpent: "30m",
  timeSpentSeconds: 1800,
  id: "10002",
  issueId: "10123",
};

/**
 * Worklog entry with different time formats
 */
export const mockVariousTimeFormats: WorklogEntry[] = [
  {
    ...mockWorklogEntry,
    id: "10003",
    timeSpent: "1d",
    timeSpentSeconds: 28800,
    comment: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Full day of development work",
            },
          ],
        },
      ],
    },
  },
  {
    ...mockWorklogEntry,
    id: "10004",
    timeSpent: "4h 30m",
    timeSpentSeconds: 16200,
    comment: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Morning and afternoon sessions",
            },
          ],
        },
      ],
    },
  },
  {
    ...mockWorklogEntry,
    id: "10005",
    timeSpent: "1w",
    timeSpentSeconds: 144000,
    comment: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Week-long project work",
            },
          ],
        },
      ],
    },
  },
];

/**
 * Multiple worklog entries for list testing
 */
export const mockWorklogList: WorklogEntry[] = [
  mockWorklogEntry,
  mockMinimalWorklogEntry,
  ...mockVariousTimeFormats,
];

/**
 * Empty worklog list
 */
export const mockEmptyWorklogList: WorklogEntry[] = [];

/**
 * Worklog factory for creating custom entries
 */
export const worklogMockFactory = {
  /**
   * Create a worklog entry with custom properties
   */
  createWorklogEntry(overrides: Partial<WorklogEntry> = {}): WorklogEntry {
    return {
      ...mockWorklogEntry,
      ...overrides,
    };
  },

  /**
   * Create multiple worklog entries
   */
  createWorklogList(
    count: number,
    baseEntry: Partial<WorklogEntry> = {},
  ): WorklogEntry[] {
    return Array.from({ length: count }, (_, index) => ({
      ...mockWorklogEntry,
      ...baseEntry,
      id: `1000${index + 1}`,
      timeSpent: `${index + 1}h`,
      timeSpentSeconds: (index + 1) * 3600,
    }));
  },

  /**
   * Create worklog with specific time format
   */
  createWorklogWithTime(
    timeSpent: string,
    timeSpentSeconds: number,
  ): WorklogEntry {
    return {
      ...mockWorklogEntry,
      timeSpent,
      timeSpentSeconds,
    };
  },

  /**
   * Create worklog with specific comment
   */
  createWorklogWithComment(commentText: string): WorklogEntry {
    return {
      ...mockWorklogEntry,
      comment: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: commentText,
              },
            ],
          },
        ],
      },
    };
  },
};
