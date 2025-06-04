/**
 * Issue Field Validator
 *
 * Handles validation and null-checking of issue fields using Zod schemas
 * Extracted from IssueFormatter to reduce complexity
 */
import { z } from "zod";
import type { Issue } from "../models/issue.models";

/**
 * Schema for JIRA issue keys
 */
export const issueKeySchema = z
  .string()
  .regex(/^[A-Z]+-\d+$/, "Issue key must be in the format PROJECT-123");

/**
 * Schema for User objects
 */
export const userSchema = z
  .object({
    accountId: z.string().optional(),
    displayName: z.string().optional(),
    emailAddress: z.string().email().optional(),
    avatarUrls: z.record(z.string()).optional(),
  })
  .optional()
  .nullable();

/**
 * Schema for issue type
 */
export const issueTypeSchema = z
  .object({
    name: z.string().nullable(),
    iconUrl: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

/**
 * Schema for issue status
 */
export const issueStatusSchema = z
  .object({
    name: z.string().nullable(),
    statusCategory: z
      .object({
        name: z.string().nullable(),
        colorName: z.string().nullable(),
      })
      .optional(),
  })
  .optional()
  .nullable();

/**
 * Schema for issue priority
 */
export const issuePrioritySchema = z
  .object({
    name: z.string().nullable(),
    iconUrl: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

/**
 * Schema for ADF (Atlassian Document Format) content
 */
export const adfContentSchema = z
  .object({
    type: z.string(),
    content: z.array(z.any()).optional(),
    text: z.string().optional(),
    attrs: z.record(z.any()).optional(),
  })
  .passthrough();

/**
 * Schema for ADF Document
 */
export const adfDocumentSchema = z
  .object({
    version: z.number(),
    type: z.literal("doc"),
    content: z.array(adfContentSchema),
  })
  .passthrough();

/**
 * Schema for issue description (can be ADF or string)
 */
export const issueDescriptionSchema = z
  .union([adfDocumentSchema, adfContentSchema, z.string()])
  .nullable()
  .optional();

/**
 * Schema for issue fields
 */
export const issueFieldsSchema = z
  .object({
    summary: z.string().nullable().optional(),
    description: issueDescriptionSchema,
    issuetype: issueTypeSchema,
    status: issueStatusSchema,
    priority: issuePrioritySchema,
    assignee: userSchema,
    reporter: userSchema,
    created: z.string().nullable().optional(),
    updated: z.string().nullable().optional(),
    labels: z.array(z.string()).nullable().optional(),
  })
  .passthrough(); // Allow additional fields with index signature

/**
 * Schema for complete Issue object
 */
export const issueSchema = z.object({
  id: z.string(),
  key: issueKeySchema,
  self: z.string().nullable(),
  fields: issueFieldsSchema.nullable().optional(),
});

/**
 * Schema for validating safe field values
 */
export const safeFieldValuesSchema = z.object({
  key: z.string(),
  summary: z.string(),
  status: z.string(),
  priority: z.string(),
  assignee: z.string(),
});

/**
 * Type exports
 */
export type IssueSchemaType = z.infer<typeof issueSchema>;
export type IssueFieldsSchemaType = z.infer<typeof issueFieldsSchema>;
export type SafeFieldValuesType = z.infer<typeof safeFieldValuesSchema>;

/**
 * Validation helper functions
 */
export const validateIssue = (data: unknown) => issueSchema.safeParse(data);
export const validateIssueFields = (data: unknown) =>
  issueFieldsSchema.safeParse(data);
export const validateSafeFieldValues = (data: unknown) =>
  safeFieldValuesSchema.safeParse(data);

/**
 * Type guards using Zod schemas
 */
export const isValidIssue = (data: unknown): data is IssueSchemaType => {
  return issueSchema.safeParse(data).success;
};

export const isValidIssueFields = (
  data: unknown,
): data is IssueFieldsSchemaType => {
  return issueFieldsSchema.safeParse(data).success;
};

/**
 * Validates issue fields and provides safe access to field values using Zod schemas
 */
export class IssueFieldValidator {
  /**
   * Check if issue is valid and has basic structure using Zod schema
   */
  isValidIssue(issue: Issue): boolean {
    return issueSchema.safeParse(issue).success;
  }

  /**
   * Check if issue has fields but they are null/undefined
   */
  hasEmptyFields(issue: Issue): boolean {
    // Use Zod validation to check structure
    const result = validateIssue(issue);
    if (!result.success) {
      return true; // Invalid structure means empty/missing fields
    }

    return !!(issue && !issue.fields);
  }

  /**
   * Check if description field has meaningful content using Zod schema validation
   */
  hasValidDescription(issue: Issue): boolean {
    const result = issueSchema.safeParse(issue);
    if (!result.success || !result.data.fields?.description) {
      return false;
    }

    const description = result.data.fields.description;

    // Handle ADF object descriptions
    if (typeof description === "object" && description !== null) {
      const adfResult = adfDocumentSchema.safeParse(description);
      if (adfResult.success) {
        return adfResult.data.content && adfResult.data.content.length > 0;
      }
      // Handle ADF content nodes
      const contentResult = adfContentSchema.safeParse(description);
      if (contentResult.success) {
        return !!(
          contentResult.data.content && contentResult.data.content.length > 0
        );
      }
    }

    // Handle string descriptions
    if (typeof description === "string") {
      return description.trim().length > 0;
    }

    return false;
  }

  /**
   * Check if issue has labels using Zod schema validation
   */
  hasLabels(issue: Issue): boolean {
    const result = issueSchema.safeParse(issue);
    return !!(
      result.success &&
      result.data.fields?.labels &&
      Array.isArray(result.data.fields.labels) &&
      result.data.fields.labels.length > 0
    );
  }

  /**
   * Check if issue has date information using Zod schema validation
   */
  hasDateInfo(issue: Issue): boolean {
    const result = issueSchema.safeParse(issue);
    return !!(
      result.success &&
      (result.data.fields?.created || result.data.fields?.updated)
    );
  }

  /**
   * Check if issue has a valid self URL for JIRA link generation using Zod schema validation
   */
  hasValidSelfUrl(issue: Issue): boolean {
    const result = issueSchema.safeParse(issue);
    return !!(
      result.success &&
      result.data.self &&
      typeof result.data.self === "string"
    );
  }

  /**
   * Get safe field values with fallbacks using Zod schema validation
   */
  getSafeFieldValues(issue: Issue): SafeFieldValuesType {
    // First validate the issue structure
    const issueValidation = validateIssue(issue);

    if (!issueValidation.success || !issueValidation.data.fields) {
      const fallbackValues = {
        key: issue?.key || "",
        summary: "No Summary",
        status: "Unknown",
        priority: "None",
        assignee: "Unassigned",
      };

      // Validate the fallback values match our schema
      const fallbackValidation = validateSafeFieldValues(fallbackValues);
      return fallbackValidation.success
        ? fallbackValidation.data
        : fallbackValues;
    }

    // Extract safe values from validated issue
    const validatedIssue = issueValidation.data;
    const fields = validatedIssue.fields;

    const safeValues = {
      key: validatedIssue.key || "",
      summary: fields?.summary || "No Summary",
      status: fields?.status?.name || "Unknown",
      priority: fields?.priority?.name || "None",
      assignee: fields?.assignee?.displayName || "Unassigned",
    };

    // Validate the extracted values match our schema
    const safeValuesValidation = validateSafeFieldValues(safeValues);
    return safeValuesValidation.success
      ? safeValuesValidation.data
      : safeValues;
  }

  /**
   * Validate issue against schema and return validation result
   */
  validateIssueStructure(issue: unknown) {
    return validateIssue(issue);
  }

  /**
   * Get validated issue data if valid, otherwise return null
   */
  getValidatedIssue(issue: unknown) {
    const result = validateIssue(issue);
    return result.success ? result.data : null;
  }
}

// Export standalone validation functions for external use
export const hasValidDescription = (issue: unknown): boolean => {
  const result = issueSchema.safeParse(issue);
  if (!result.success || !result.data.fields?.description) {
    return false;
  }

  const description = result.data.fields.description;

  // Handle ADF object descriptions
  if (typeof description === "object" && description !== null) {
    const adfResult = adfDocumentSchema.safeParse(description);
    if (adfResult.success) {
      return adfResult.data.content && adfResult.data.content.length > 0;
    }
    // Handle ADF content nodes
    const contentResult = adfContentSchema.safeParse(description);
    if (contentResult.success) {
      return !!(
        contentResult.data.content && contentResult.data.content.length > 0
      );
    }
  }

  // Handle string descriptions
  if (typeof description === "string") {
    return description.trim().length > 0;
  }

  return false;
};

export const hasLabels = (issue: unknown): boolean => {
  const result = issueSchema.safeParse(issue);
  return !!(
    result.success &&
    result.data.fields?.labels &&
    Array.isArray(result.data.fields.labels) &&
    result.data.fields.labels.length > 0
  );
};

export const hasDateInfo = (issue: unknown): boolean => {
  const result = issueSchema.safeParse(issue);
  return !!(
    result.success &&
    (result.data.fields?.created || result.data.fields?.updated)
  );
};

export const hasValidSelfUrl = (issue: unknown): boolean => {
  const result = issueSchema.safeParse(issue);
  return !!(
    result.success &&
    result.data.self &&
    typeof result.data.self === "string"
  );
};
