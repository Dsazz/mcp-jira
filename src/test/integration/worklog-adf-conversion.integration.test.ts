/**
 * Worklog ADF Conversion Integration Test
 *
 * Tests the integration between worklog repository and ADF parser
 * to ensure comments are properly converted to ADF format before
 * being sent to JIRA API.
 */

import { describe, expect, it, jest, beforeEach } from "bun:test";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import { WorklogRepositoryImpl } from "@features/jira/issues/repositories/worklog.repository";
import type { ADFDocument } from "@features/jira/shared/parsers/adf.parser";

describe("Worklog ADF Conversion Integration", () => {
  let repository: WorklogRepositoryImpl;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = {
      sendRequest: jest.fn(),
    } as unknown as HttpClient;
    repository = new WorklogRepositoryImpl(mockHttpClient);
  });

  describe("addWorklog ADF conversion", () => {
    it("should convert simple string comment to ADF format", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const timeSpent = "2h";
      const comment = "Fixed authentication bug";
      const expectedADFComment: ADFDocument = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Fixed authentication bug",
              },
            ],
          },
        ],
      };

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue({
        id: "10001",
        timeSpent,
        comment: expectedADFComment,
      });

      // Act
      await repository.addWorklog(issueKey, timeSpent, comment);

      // Assert
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: {
          timeSpent,
          comment: expectedADFComment,
        },
      });
    });

    it("should convert multiline comment to ADF with multiple paragraphs", async () => {
      // Arrange
      const issueKey = "TEST-456";
      const timeSpent = "3h";
      const comment =
        "Fixed authentication bug\n\nAlso updated documentation\n\nTested on staging";
      const expectedADFComment: ADFDocument = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Fixed authentication bug",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Also updated documentation",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Tested on staging",
              },
            ],
          },
        ],
      };

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue({
        id: "10002",
        timeSpent,
        comment: expectedADFComment,
      });

      // Act
      await repository.addWorklog(issueKey, timeSpent, comment);

      // Assert
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: {
          timeSpent,
          comment: expectedADFComment,
        },
      });
    });

    it("should not include comment in body when comment is empty", async () => {
      // Arrange
      const issueKey = "TEST-789";
      const timeSpent = "1h";
      const comment = "";

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue({
        id: "10003",
        timeSpent,
      });

      // Act
      await repository.addWorklog(issueKey, timeSpent, comment);

      // Assert
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: {
          timeSpent,
          // No comment field should be present
        },
      });
    });

    it("should not include comment in body when comment is undefined", async () => {
      // Arrange
      const issueKey = "TEST-101";
      const timeSpent = "30m";

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue({
        id: "10004",
        timeSpent,
      });

      // Act
      await repository.addWorklog(issueKey, timeSpent, undefined);

      // Assert
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: {
          timeSpent,
          // No comment field should be present
        },
      });
    });
  });

  describe("updateWorklog ADF conversion", () => {
    it("should convert string comment to ADF format when updating", async () => {
      // Arrange
      const issueKey = "TEST-UPDATE";
      const worklogId = "20001";
      const timeSpent = "4h";
      const comment = "Updated work description with more details";
      const expectedADFComment: ADFDocument = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Updated work description with more details",
              },
            ],
          },
        ],
      };

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue({
        id: worklogId,
        timeSpent,
        comment: expectedADFComment,
      });

      // Act
      await repository.updateWorklog(issueKey, worklogId, timeSpent, comment);

      // Assert
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "PUT",
        body: {
          timeSpent,
          comment: expectedADFComment,
        },
      });
    });

    it("should handle complex comment with special characters", async () => {
      // Arrange
      const issueKey = "TEST-SPECIAL";
      const worklogId = "20002";
      const timeSpent = "2h 30m";
      const comment =
        "Fixed bug with special chars: @#$%^&*()_+{}|:<>?[]\\;',./`~";
      const expectedADFComment: ADFDocument = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Fixed bug with special chars: @#$%^&*()_+{}|:<>?[]\\;',./`~",
              },
            ],
          },
        ],
      };

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue({
        id: worklogId,
        timeSpent,
        comment: expectedADFComment,
      });

      // Act
      await repository.updateWorklog(issueKey, worklogId, timeSpent, comment);

      // Assert
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "PUT",
        body: {
          timeSpent,
          comment: expectedADFComment,
        },
      });
    });
  });

  describe("real-world scenarios", () => {
    it("should handle typical development work log comment", async () => {
      // Arrange
      const issueKey = "PROJ-1234";
      const timeSpent = "5h 30m";
      const comment = `Implemented user authentication feature:

- Added login/logout functionality
- Integrated with OAuth provider
- Added session management
- Updated user interface
- Added unit tests

Tested on development environment and ready for review.`;

      const expectedADFComment: ADFDocument = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Implemented user authentication feature:",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "- Added login/logout functionality\n- Integrated with OAuth provider\n- Added session management\n- Updated user interface\n- Added unit tests",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Tested on development environment and ready for review.",
              },
            ],
          },
        ],
      };

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue({
        id: "30001",
        timeSpent,
        comment: expectedADFComment,
      });

      // Act
      await repository.addWorklog(issueKey, timeSpent, comment);

      // Assert
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: {
          timeSpent,
          comment: expectedADFComment,
        },
      });
    });

    it("should handle bug fix work log comment", async () => {
      // Arrange
      const issueKey = "BUG-567";
      const timeSpent = "2h 15m";
      const comment = `Fixed critical authentication bug:

Root cause: Session timeout not properly handled
Solution: Added proper session validation and refresh logic

Changes made:
- Updated session middleware
- Added error handling for expired sessions
- Improved user feedback for authentication failures

Verified fix works correctly in all browsers.`;

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue({
        id: "30002",
        timeSpent,
      });

      // Act
      await repository.addWorklog(issueKey, timeSpent, comment);

      // Assert - Verify that the comment was converted to ADF format
      const callArgs = (mockHttpClient.sendRequest as jest.Mock).mock
        .calls[0][0];
      expect(callArgs.body.comment).toBeDefined();
      expect(callArgs.body.comment.type).toBe("doc");
      expect(callArgs.body.comment.version).toBe(1);
      expect(callArgs.body.comment.content).toBeArray();
      expect(callArgs.body.comment.content.length).toBeGreaterThan(1);
    });
  });
});
