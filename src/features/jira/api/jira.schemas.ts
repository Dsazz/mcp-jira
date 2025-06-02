/**
 * JIRA Schemas
 *
 * Common schema definitions for JIRA API data validation
 */
import { z } from "zod";

/**
 * Schema for validating JIRA issue keys
 *
 * JIRA issue keys follow the pattern of project key + hyphen + number
 * For example: PROJ-123, ABC-456, etc.
 */
export const issueKeySchema = z
  .string()
  .regex(/^[A-Z]+-\d+$/, "Issue key must be in the format PROJECT-123");

/**
 * Schema for get issue comments parameters
 * Implements progressive disclosure approach from creative phase decisions
 */
export const getIssueCommentsSchema = z.object({
  // Core parameters (required/essential)
  issueKey: issueKeySchema,

  // Basic options (most common use cases)
  maxComments: z.number().int().min(1).max(100).optional().default(10),

  // Advanced options (power user features)
  includeInternal: z.boolean().optional().default(false),
  orderBy: z.enum(["created", "updated"]).optional().default("created"),
  authorFilter: z.string().min(1).optional(),
  dateRange: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
});

/**
 * Type for get issue comments parameters
 */
export type GetIssueCommentsParams = z.infer<typeof getIssueCommentsSchema>;

/**
 * Base schema for search parameters (without refinement)
 * Used for MCP tool parameter definition
 */
export const searchJiraIssuesBaseSchema = z.object({
  // Advanced JQL option
  jql: z.string().min(1).optional(),

  // Helper parameters (ignored if jql provided)
  assignedToMe: z.boolean().optional(),
  project: z.string().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  text: z.string().optional(),

  // Common options
  maxResults: z.number().min(1).max(50).default(25),
  fields: z.array(z.string()).optional(),
});

/**
 * Schema for search JIRA issues with hybrid JQL + helper parameters
 */
export const searchJiraIssuesSchema = searchJiraIssuesBaseSchema.refine(
  (data) =>
    data.jql || data.assignedToMe || data.project || data.status || data.text,
  {
    message:
      "Either 'jql' parameter or at least one helper parameter must be provided",
  },
);

/**
 * Type for search parameters
 */
export type SearchJiraIssuesParams = z.infer<typeof searchJiraIssuesSchema>;

/**
 * Build JQL query from helper parameters
 * @param params - Search parameters
 * @returns JQL query string
 */
export function buildJQLFromHelpers(params: SearchJiraIssuesParams): string {
  // If JQL is provided directly, use it
  if (params.jql) {
    return params.jql;
  }

  const conditions: string[] = [];

  if (params.assignedToMe) {
    conditions.push("assignee = currentUser()");
  }

  if (params.project) {
    conditions.push(`project = "${params.project}"`);
  }

  if (params.status) {
    const statuses = Array.isArray(params.status)
      ? params.status
      : [params.status];
    conditions.push(`status IN (${statuses.map((s) => `"${s}"`).join(", ")})`);
  }

  if (params.text) {
    const escapedText = params.text.replace(/"/g, '\\"');
    conditions.push(
      `(summary ~ "${escapedText}" OR description ~ "${escapedText}")`,
    );
  }

  return `${conditions.join(" AND ")} ORDER BY updated DESC`;
}

/**
 * Schema for common JIRA issue fields
 */
export const issueFieldsSchema = z.object({
  id: z.string(),
  key: issueKeySchema,
  fields: z.object({
    summary: z.string().optional(),
    description: z.string().nullable().optional(),
    status: z
      .object({
        name: z.string(),
      })
      .optional(),
    priority: z
      .object({
        name: z.string(),
      })
      .optional(),
    updated: z.string().optional(),
  }),
});

/**
 * Type for JIRA issue data
 */
export type JiraIssue = z.infer<typeof issueFieldsSchema>;

/**
 * Type for JIRA issue list
 */
export type JiraIssueList = JiraIssue[];

/**
 * Schema for JIRA issue creation parameters
 * Supports comprehensive issue creation with templates and validation
 */
export const createIssueParamsSchema = z.object({
  // Required fields
  projectKey: z
    .string()
    .min(1, "Project key is required")
    .max(50, "Project key too long")
    .regex(
      /^[A-Z0-9_]+$/,
      "Project key must contain only uppercase letters, numbers, and underscores",
    ),

  summary: z
    .string()
    .min(1, "Summary is required")
    .max(255, "Summary must be 255 characters or less"),

  issueType: z
    .string()
    .min(1, "Issue type is required")
    .max(50, "Issue type name too long"),

  // Optional core fields
  description: z
    .string()
    .max(32767, "Description too long (max 32,767 characters)")
    .optional(),

  priority: z.enum(["Highest", "High", "Medium", "Low", "Lowest"]).optional(),

  assignee: z
    .string()
    .min(1, "Assignee cannot be empty")
    .max(255, "Assignee identifier too long")
    .optional(),

  // Array fields with limits
  labels: z
    .array(z.string().min(1).max(255))
    .max(10, "Maximum 10 labels allowed")
    .optional(),

  components: z
    .array(z.string().min(1).max(255))
    .max(5, "Maximum 5 components allowed")
    .optional(),

  fixVersions: z
    .array(z.string().min(1).max(255))
    .max(5, "Maximum 5 fix versions allowed")
    .optional(),

  // Hierarchy fields
  parentIssueKey: issueKeySchema.optional(),

  // Template support for common issue types
  template: z.enum(["bug", "feature", "task", "story", "epic"]).optional(),

  // Advanced estimation fields
  timeEstimate: z
    .string()
    .regex(
      /^\d+[hdw]$/,
      "Time estimate must be in format: number followed by h (hours), d (days), or w (weeks)",
    )
    .optional(),

  // Bug-specific fields
  environment: z
    .string()
    .max(1000, "Environment description too long")
    .optional(),

  // Agile fields
  storyPoints: z
    .number()
    .int()
    .min(0, "Story points cannot be negative")
    .max(100, "Story points too high (max 100)")
    .optional(),

  // Custom fields support
  customFields: z.record(z.string(), z.any()).optional(),
});

/**
 * Type for issue creation parameters
 */
export type CreateIssueParams = z.infer<typeof createIssueParamsSchema>;

/**
 * Interface for JIRA API issue creation request
 * Maps to JIRA REST API v2 create issue endpoint
 */
export interface CreateIssueRequest {
  projectKey: string;
  summary: string;
  description?: string;
  issueType: string;
  priority?: string;
  assignee?: string;
  labels?: string[];
  components?: string[];
  fixVersions?: string[];
  parentIssueKey?: string;
  timeEstimate?: string;
  environment?: string;
  storyPoints?: number;
  customFields?: Record<string, unknown>;
}

/**
 * Template configurations for common issue types
 */
export const issueTemplates = {
  bug: {
    issueType: "Bug",
    priority: "High",
    defaultDescription: `**Bug Description:**
[Describe the bug]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What you expected to happen]

**Actual Behavior:**
[What actually happened]

**Environment:**
- Browser/OS: 
- Version: 

**Additional Context:**
[Any additional information]`,
  },

  feature: {
    issueType: "Story",
    priority: "Medium",
    defaultDescription: `**Feature Request:**
[Describe the new feature]

**User Story:**
As a [user type], I want [functionality] so that [benefit].

**Acceptance Criteria:**
- [ ] 
- [ ] 
- [ ] 

**Additional Requirements:**
[Any additional requirements or constraints]`,
  },

  task: {
    issueType: "Task",
    priority: "Medium",
    defaultDescription: `**Task Description:**
[Describe what needs to be done]

**Acceptance Criteria:**
- [ ] 
- [ ] 
- [ ] 

**Additional Notes:**
[Any additional information or context]`,
  },

  story: {
    issueType: "Story",
    priority: "Medium",
    defaultDescription: `**User Story:**
As a [user type], I want [functionality] so that [benefit].

**Acceptance Criteria:**
- [ ] 
- [ ] 
- [ ] 

**Definition of Done:**
- [ ] Code reviewed
- [ ] Tests written
- [ ] Documentation updated`,
  },

  epic: {
    issueType: "Epic",
    priority: "Medium",
    defaultDescription: `**Epic Description:**
[Describe the epic and its goals]

**Objectives:**
- 
- 
- 

**Success Criteria:**
[How will we know this epic is successful?]

**User Impact:**
[How will this benefit users?]`,
  },
} as const;

/**
 * Apply template to issue creation parameters
 * @param params - Base parameters
 * @param template - Template type to apply
 * @returns Enhanced parameters with template applied
 */
export function applyIssueTemplate(
  params: CreateIssueParams,
  template: keyof typeof issueTemplates,
): CreateIssueParams {
  const templateConfig = issueTemplates[template];

  return {
    ...params,
    issueType: params.issueType || templateConfig.issueType,
    priority: params.priority || templateConfig.priority,
    description: params.description || templateConfig.defaultDescription,
  };
}

/**
 * Transform CreateIssueParams to CreateIssueRequest for API
 * @param params - Validated parameters
 * @returns API request object
 */
export function transformToCreateRequest(
  params: CreateIssueParams,
): CreateIssueRequest {
  return {
    projectKey: params.projectKey,
    summary: params.summary,
    description: params.description,
    issueType: params.issueType,
    priority: params.priority,
    assignee: params.assignee,
    labels: params.labels,
    components: params.components,
    fixVersions: params.fixVersions,
    parentIssueKey: params.parentIssueKey,
    timeEstimate: params.timeEstimate,
    environment: params.environment,
    storyPoints: params.storyPoints,
    customFields: params.customFields,
  };
}

/**
 * Schema for JIRA issue update parameters
 * Supports comprehensive issue updates including field changes, transitions, and array operations
 */
export const updateIssueParamsSchema = z.object({
  // Required field
  issueKey: issueKeySchema,

  // Field updates (direct field replacement)
  summary: z
    .string()
    .min(1, "Summary cannot be empty")
    .max(255, "Summary must be 255 characters or less")
    .optional(),

  description: z
    .string()
    .max(32767, "Description too long (max 32,767 characters)")
    .optional(),

  priority: z.enum(["Highest", "High", "Medium", "Low", "Lowest"]).optional(),

  assignee: z
    .string()
    .min(1, "Assignee cannot be empty")
    .max(255, "Assignee identifier too long")
    .optional(),

  // Status transition
  status: z
    .string()
    .min(1, "Status cannot be empty")
    .max(255, "Status name too long")
    .optional(),

  // Array field operations
  labels: z
    .object({
      operation: z.enum(["set", "add", "remove"]),
      values: z
        .array(z.string().min(1).max(255))
        .max(10, "Maximum 10 labels allowed"),
    })
    .optional(),

  components: z
    .object({
      operation: z.enum(["set", "add", "remove"]),
      values: z
        .array(z.string().min(1).max(255))
        .max(5, "Maximum 5 components allowed"),
    })
    .optional(),

  fixVersions: z
    .object({
      operation: z.enum(["set", "add", "remove"]),
      values: z
        .array(z.string().min(1).max(255))
        .max(5, "Maximum 5 fix versions allowed"),
    })
    .optional(),

  // Time tracking
  timeEstimate: z
    .string()
    .regex(
      /^(\d+[wdhm]\s*)+$/,
      "Time estimate must be in JIRA format (e.g., '2h', '1d 4h', '30m')",
    )
    .optional(),

  remainingEstimate: z
    .string()
    .regex(
      /^(\d+[wdhm]\s*)+$/,
      "Remaining estimate must be in JIRA format (e.g., '2h', '1d 4h', '30m')",
    )
    .optional(),

  // Worklog entry
  worklog: z
    .object({
      timeSpent: z
        .string()
        .regex(
          /^(\d+[wdhm]\s*)+$/,
          "Time spent must be in JIRA format (e.g., '2h', '1d 4h', '30m')",
        ),
      comment: z.string().max(32767, "Worklog comment too long").optional(),
      started: z
        .string()
        .datetime("Started time must be a valid ISO datetime")
        .optional(),
    })
    .optional(),

  // Advanced options
  notifyUsers: z.boolean().optional().default(true),

  // Custom fields (for advanced users)
  customFields: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Type for update issue parameters
 */
export type UpdateIssueParams = z.infer<typeof updateIssueParamsSchema>;

/**
 * Schema for issue transition parameters
 */
export const transitionIssueParamsSchema = z.object({
  issueKey: issueKeySchema,
  transitionId: z.string().min(1, "Transition ID is required"),
  fields: z.record(z.string(), z.unknown()).optional(),
  notifyUsers: z.boolean().optional().default(true),
});

/**
 * Type for transition issue parameters
 */
export type TransitionIssueParams = z.infer<typeof transitionIssueParamsSchema>;

/**
 * Schema for worklog entry parameters
 */
export const addWorklogParamsSchema = z.object({
  issueKey: issueKeySchema,
  timeSpent: z
    .string()
    .regex(
      /^(\d+[wdhm]\s*)+$/,
      "Time spent must be in JIRA format (e.g., '2h', '1d 4h', '30m')",
    ),
  comment: z.string().max(32767, "Worklog comment too long").optional(),
  started: z
    .string()
    .datetime("Started time must be a valid ISO datetime")
    .optional(),
});

/**
 * Type for add worklog parameters
 */
export type AddWorklogParams = z.infer<typeof addWorklogParamsSchema>;

/**
 * Transform update issue parameters to JIRA API request format
 */
export function transformToUpdateRequest(params: UpdateIssueParams): {
  fields?: Record<string, unknown>;
  update?: Record<string, unknown>;
  transition?: { id: string };
  notifyUsers?: boolean;
} {
  const request: {
    fields?: Record<string, unknown>;
    update?: Record<string, unknown>;
    transition?: { id: string };
    notifyUsers?: boolean;
  } = {};

  // Handle field updates
  const fields: Record<string, unknown> = {};

  if (params.summary !== undefined) {
    fields.summary = params.summary;
  }

  if (params.description !== undefined) {
    fields.description = params.description;
  }

  if (params.priority !== undefined) {
    fields.priority = { name: params.priority };
  }

  if (params.assignee !== undefined) {
    fields.assignee = { accountId: params.assignee };
  }

  if (params.timeEstimate !== undefined) {
    fields.timeoriginalestimate = params.timeEstimate;
  }

  if (params.remainingEstimate !== undefined) {
    fields.timeestimate = params.remainingEstimate;
  }

  // Handle custom fields
  if (params.customFields) {
    Object.assign(fields, params.customFields);
  }

  if (Object.keys(fields).length > 0) {
    request.fields = fields;
  }

  // Handle array operations
  const updates: Record<string, unknown> = {};

  if (params.labels) {
    updates.labels = transformArrayOperation(params.labels);
  }

  if (params.components) {
    updates.components = transformArrayOperation(params.components, "name");
  }

  if (params.fixVersions) {
    updates.fixVersions = transformArrayOperation(params.fixVersions, "name");
  }

  if (Object.keys(updates).length > 0) {
    request.update = updates;
  }

  // Handle notification preference
  if (params.notifyUsers !== undefined) {
    request.notifyUsers = params.notifyUsers;
  }

  return request;
}

/**
 * Transform array operation to JIRA update format
 */
function transformArrayOperation(
  operation: { operation: "set" | "add" | "remove"; values: string[] },
  valueField?: string,
): unknown[] {
  const transformValue = (value: string) =>
    valueField ? { [valueField]: value } : value;

  switch (operation.operation) {
    case "set":
      return [{ set: operation.values.map(transformValue) }];
    case "add":
      return operation.values.map((value) => ({ add: transformValue(value) }));
    case "remove":
      return operation.values.map((value) => ({
        remove: transformValue(value),
      }));
    default:
      throw new Error(`Unknown array operation: ${operation.operation}`);
  }
}

/**
 * Schema for get projects parameters
 */
export const getProjectsParamsSchema = z.object({
  expand: z
    .array(z.string())
    .optional()
    .describe(
      "Additional fields to expand (e.g., ['description', 'lead', 'issueTypes'])",
    ),
  recent: z
    .number()
    .min(1)
    .max(20)
    .optional()
    .describe("Number of recently accessed projects to return"),
  typeKey: z
    .string()
    .optional()
    .describe(
      "Filter by project type (e.g., 'software', 'service_desk', 'business')",
    ),
  categoryId: z.number().optional().describe("Filter by project category ID"),
  searchQuery: z
    .string()
    .optional()
    .describe("Search query to filter projects by name or key"),
  orderBy: z
    .enum([
      "category",
      "issueCount",
      "key",
      "lastIssueUpdatedTime",
      "name",
      "owner",
      "archivedDate",
      "deletedDate",
    ])
    .optional()
    .describe("Field to order results by"),
  maxResults: z
    .number()
    .min(1)
    .max(1000)
    .default(50)
    .describe("Maximum number of projects to return"),
  startAt: z
    .number()
    .min(0)
    .default(0)
    .describe("Starting index for pagination"),
});

export type GetProjectsParams = z.infer<typeof getProjectsParamsSchema>;

/**
 * Schema for get boards parameters
 */
export const getBoardsParamsSchema = z.object({
  startAt: z
    .number()
    .min(0)
    .default(0)
    .describe("Starting index for pagination"),
  maxResults: z
    .number()
    .min(1)
    .max(1000)
    .default(50)
    .describe("Maximum number of boards to return"),
  type: z
    .enum(["scrum", "kanban", "simple"])
    .optional()
    .describe("Filter by board type"),
  name: z.string().optional().describe("Filter boards by name (partial match)"),
  projectKeyOrId: z
    .string()
    .optional()
    .describe("Filter boards by project key or ID"),
  accountIdLocation: z
    .string()
    .optional()
    .describe("Filter boards by account ID location"),
  projectLocation: z
    .string()
    .optional()
    .describe("Filter boards by project location"),
  includePrivate: z
    .boolean()
    .optional()
    .describe("Include private boards in results"),
  negateLocationFiltering: z
    .boolean()
    .optional()
    .describe("Negate location filtering"),
  orderBy: z
    .enum(["name", "-name", "favourite", "-favourite"])
    .optional()
    .describe("Field to order results by"),
  expand: z.string().optional().describe("Additional fields to expand"),
  filterId: z.number().optional().describe("Filter boards by filter ID"),
});

export type GetBoardsParams = z.infer<typeof getBoardsParamsSchema>;

/**
 * Schema for get sprints parameters
 */
export const getSprintsParamsSchema = z.object({
  boardId: z.number().min(1).describe("Board ID to get sprints for"),
  startAt: z
    .number()
    .min(0)
    .default(0)
    .describe("Starting index for pagination"),
  maxResults: z
    .number()
    .min(1)
    .max(1000)
    .default(50)
    .describe("Maximum number of sprints to return"),
  state: z
    .enum(["closed", "active", "future"])
    .optional()
    .describe("Filter sprints by state"),
});

export type GetSprintsParams = z.infer<typeof getSprintsParamsSchema>;
