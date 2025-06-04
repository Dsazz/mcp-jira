/**
 * Issue Comment Validator Tests
 *
 * Tests for issue comment validation functionality
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { CommentParamsValidationError } from "@features/jira/issues/validators/errors";
import {
  type GetIssueCommentsParams,
  type IssueCommentValidator,
  IssueCommentValidatorImpl,
  getIssueCommentsSchema,
} from "@features/jira/issues/validators/issue-comment.validator";

describe("IssueCommentValidator", () => {
  let validator: IssueCommentValidator;

  beforeEach(() => {
    validator = new IssueCommentValidatorImpl();
  });

  describe("validateGetCommentsParams", () => {
    it("should validate valid parameters successfully", () => {
      // Arrange
      const validParams: GetIssueCommentsParams = {
        issueKey: "TEST-123",
        maxComments: 10,
        includeInternal: false,
        orderBy: "created",
      };

      // Act
      const result = validator.validateGetCommentsParams(validParams);

      // Assert
      expect(result).toEqual(validParams);
    });

    it("should apply default values for optional parameters", () => {
      // Arrange
      const minimalParams: GetIssueCommentsParams = {
        issueKey: "TEST-123",
        maxComments: 10,
        includeInternal: false,
        orderBy: "created",
      };

      // Act
      const result = validator.validateGetCommentsParams(minimalParams);

      // Assert
      expect(result.issueKey).toBe("TEST-123");
      expect(result.maxComments).toBe(10);
      expect(result.includeInternal).toBe(false);
      expect(result.orderBy).toBe("created");
    });

    it("should validate with all optional parameters", () => {
      // Arrange
      const fullParams: GetIssueCommentsParams = {
        issueKey: "PROJ-456",
        maxComments: 50,
        includeInternal: true,
        orderBy: "updated",
        authorFilter: "john.doe",
        dateRange: {
          from: "2023-01-01T00:00:00.000Z",
          to: "2023-12-31T23:59:59.999Z",
        },
      };

      // Act
      const result = validator.validateGetCommentsParams(fullParams);

      // Assert
      expect(result).toEqual(fullParams);
    });

    it("should throw error for invalid issue key", () => {
      // Arrange
      const invalidParams = {
        issueKey: "invalid-key",
        maxComments: 10,
        includeInternal: false,
        orderBy: "created" as const,
      };

      // Act & Assert
      expect(() => validator.validateGetCommentsParams(invalidParams)).toThrow(
        CommentParamsValidationError,
      );
    });

    it("should throw error for invalid maxComments", () => {
      // Arrange
      const invalidParams = {
        issueKey: "TEST-123",
        maxComments: -1,
        includeInternal: false,
        orderBy: "created" as const,
      };

      // Act & Assert
      expect(() => validator.validateGetCommentsParams(invalidParams)).toThrow(
        CommentParamsValidationError,
      );
    });

    it("should throw error for maxComments exceeding limit", () => {
      // Arrange
      const invalidParams = {
        issueKey: "TEST-123",
        maxComments: 101,
        includeInternal: false,
        orderBy: "created" as const,
      };

      // Act & Assert
      expect(() => validator.validateGetCommentsParams(invalidParams)).toThrow(
        CommentParamsValidationError,
      );
    });

    it("should throw error for invalid orderBy value", () => {
      // Arrange
      const invalidParams = {
        issueKey: "TEST-123",
        maxComments: 10,
        includeInternal: false,
        orderBy: "invalid" as "created" | "updated",
      };

      // Act & Assert
      expect(() => validator.validateGetCommentsParams(invalidParams)).toThrow(
        CommentParamsValidationError,
      );
    });

    it("should throw error for empty authorFilter", () => {
      // Arrange
      const invalidParams = {
        issueKey: "TEST-123",
        maxComments: 10,
        includeInternal: false,
        orderBy: "created" as const,
        authorFilter: "",
      };

      // Act & Assert
      expect(() => validator.validateGetCommentsParams(invalidParams)).toThrow(
        CommentParamsValidationError,
      );
    });

    it("should throw error for invalid date format", () => {
      // Arrange
      const invalidParams = {
        issueKey: "TEST-123",
        maxComments: 10,
        includeInternal: false,
        orderBy: "created" as const,
        dateRange: {
          from: "invalid-date",
        },
      };

      // Act & Assert
      expect(() => validator.validateGetCommentsParams(invalidParams)).toThrow(
        CommentParamsValidationError,
      );
    });
  });

  describe("getIssueCommentsSchema", () => {
    it("should validate correct schema structure", () => {
      // Arrange
      const validData = {
        issueKey: "TEST-123",
        maxComments: 25,
        includeInternal: true,
        orderBy: "updated",
      };

      // Act
      const result = getIssueCommentsSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.issueKey).toBe("TEST-123");
        expect(result.data.maxComments).toBe(25);
        expect(result.data.includeInternal).toBe(true);
        expect(result.data.orderBy).toBe("updated");
      }
    });

    it("should reject invalid schema data", () => {
      // Arrange
      const invalidData = {
        issueKey: "",
        maxComments: "not-a-number",
      };

      // Act
      const result = getIssueCommentsSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });
  });
});
