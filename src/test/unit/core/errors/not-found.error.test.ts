import { describe, expect, test } from "bun:test";
import { McpError } from "../../../../core/errors/mcp.error";
import { NotFoundError } from "../../../../core/errors/not-found.error";

describe("NotFoundError", () => {
  describe("constructor", () => {
    test("should create error with message only", () => {
      const error = new NotFoundError("Resource not found");

      expect(error.message).toBe("Resource not found");
      expect(error.name).toBe("NotFoundError");
      expect(error.code).toBe("NOT_FOUND_ERROR");
      expect(error.context).toBeUndefined();
    });

    test("should create error with message and context", () => {
      const context = { resourceId: "123", resourceType: "page" };
      const error = new NotFoundError("Page not found", context);

      expect(error.message).toBe("Page not found");
      expect(error.name).toBe("NotFoundError");
      expect(error.code).toBe("NOT_FOUND_ERROR");
      expect(error.context).toEqual(context);
    });

    test("should create error with empty context", () => {
      const error = new NotFoundError("Resource not found", {});

      expect(error.context).toEqual({});
    });

    test("should create error with complex context", () => {
      const context = {
        resourceType: "confluence-page",
        resourceId: "page-123",
        spaceKey: "DEV",
        searchCriteria: {
          title: "Non-existent Page",
          type: "page",
        },
        availableResources: ["page-456", "page-789"],
      };
      const error = new NotFoundError("Confluence page not found", context);

      expect(error.context).toEqual(context);
    });
  });

  describe("inheritance", () => {
    test("should be instance of Error", () => {
      const error = new NotFoundError("Test error");
      expect(error).toBeInstanceOf(Error);
    });

    test("should be instance of McpError", () => {
      const error = new NotFoundError("Test error");
      expect(error).toBeInstanceOf(McpError);
    });

    test("should be instance of NotFoundError", () => {
      const error = new NotFoundError("Test error");
      expect(error).toBeInstanceOf(NotFoundError);
    });

    test("should have correct constructor name", () => {
      const error = new NotFoundError("Test error");
      expect(error.constructor.name).toBe("NotFoundError");
    });
  });

  describe("error properties", () => {
    test("should have correct error code", () => {
      const error = new NotFoundError("Test error");
      expect(error.code).toBe("NOT_FOUND_ERROR");
    });

    test("should have correct error name", () => {
      const error = new NotFoundError("Test error");
      expect(error.name).toBe("NotFoundError");
    });

    test("should have stack trace", () => {
      const error = new NotFoundError("Test error");
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });
  });

  describe("toJSON", () => {
    test("should serialize basic error to JSON", () => {
      const error = new NotFoundError("Resource not found");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "NotFoundError",
        message: "Resource not found",
        code: "NOT_FOUND_ERROR",
        context: undefined,
      });
    });

    test("should serialize error with context to JSON", () => {
      const context = { resourceId: "user-123", resourceType: "user" };
      const error = new NotFoundError("User not found", context);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "NotFoundError",
        message: "User not found",
        code: "NOT_FOUND_ERROR",
        context: context,
      });
    });

    test("should be JSON.stringify compatible", () => {
      const context = {
        resourceType: "space",
        spaceKey: "MISSING",
        searchLocation: "/api/confluence/spaces",
      };
      const error = new NotFoundError("Space not found", context);

      expect(() => JSON.stringify(error.toJSON())).not.toThrow();

      const serialized = JSON.stringify(error.toJSON());
      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe("NotFoundError");
      expect(parsed.code).toBe("NOT_FOUND_ERROR");
      expect(parsed.context).toEqual(context);
    });
  });

  describe("resource scenarios", () => {
    test("should handle Confluence page not found", () => {
      const context = {
        resourceType: "page",
        pageId: "123456",
        spaceKey: "DEV",
        title: "Missing Page",
      };
      const error = new NotFoundError("Confluence page not found", context);

      expect(error.message).toBe("Confluence page not found");
      expect(error.context?.resourceType).toBe("page");
      expect(error.context?.pageId).toBe("123456");
    });

    test("should handle Confluence space not found", () => {
      const context = {
        resourceType: "space",
        spaceKey: "NONEXISTENT",
        searchMethod: "key",
      };
      const error = new NotFoundError("Confluence space not found", context);

      expect(error.context?.resourceType).toBe("space");
      expect(error.context?.spaceKey).toBe("NONEXISTENT");
    });

    test("should handle user not found", () => {
      const context = {
        resourceType: "user",
        userId: "user-123",
        searchCriteria: { email: "missing@example.com" },
      };
      const error = new NotFoundError("User not found", context);

      expect(error.context?.resourceType).toBe("user");
      expect(error.context?.userId).toBe("user-123");
    });

    test("should handle API endpoint not found", () => {
      const context = {
        resourceType: "endpoint",
        path: "/api/v2/missing",
        method: "GET",
        availableEndpoints: ["/api/v2/pages", "/api/v2/spaces"],
      };
      const error = new NotFoundError("API endpoint not found", context);

      expect(error.context?.path).toBe("/api/v2/missing");
      expect(Array.isArray(error.context?.availableEndpoints)).toBe(true);
    });

    test("should handle file not found", () => {
      const context = {
        resourceType: "file",
        filePath: "/path/to/missing/file.txt",
        directory: "/path/to/missing",
        searchPattern: "*.txt",
      };
      const error = new NotFoundError("File not found", context);

      expect(error.context?.resourceType).toBe("file");
      expect(error.context?.filePath).toBe("/path/to/missing/file.txt");
    });
  });

  describe("search scenarios", () => {
    test("should handle search with no results", () => {
      const context = {
        searchQuery: "non-existent content",
        searchType: "content",
        searchScope: "all-spaces",
        resultsCount: 0,
      };
      const error = new NotFoundError("No search results found", context);

      expect(error.context?.searchQuery).toBe("non-existent content");
      expect(error.context?.resultsCount).toBe(0);
    });

    test("should handle filtered search with no matches", () => {
      const context = {
        searchQuery: "test",
        filters: {
          spaceKey: "DEV",
          type: "page",
          lastModified: "2023-01-01",
        },
        totalResults: 100,
        filteredResults: 0,
      };
      const error = new NotFoundError("No results match the filters", context);

      expect(error.context?.totalResults).toBe(100);
      expect(error.context?.filteredResults).toBe(0);
    });
  });

  describe("edge cases", () => {
    test("should handle empty message", () => {
      const error = new NotFoundError("");
      expect(error.message).toBe("");
      expect(error.code).toBe("NOT_FOUND_ERROR");
    });

    test("should handle very long messages", () => {
      const longMessage = `Resource not found: ${"A".repeat(1000)}`;
      const error = new NotFoundError(longMessage);
      expect(error.message).toBe(longMessage);
    });

    test("should handle special characters in message", () => {
      const specialMessage =
        "Resource not found: 🚨 Missing item with\nnewlines";
      const error = new NotFoundError(specialMessage);
      expect(error.message).toBe(specialMessage);
    });

    test("should handle null values in context", () => {
      const context = { resourceId: null, searchResult: null };
      const error = new NotFoundError("Null resource", context);
      expect(error.context?.resourceId).toBeNull();
      expect(error.context?.searchResult).toBeNull();
    });

    test("should handle undefined resource identifiers", () => {
      const context = {
        resourceId: undefined,
        resourceType: "unknown",
        searchAttempted: true,
      };
      const error = new NotFoundError("Unknown resource", context);
      expect(error.context?.resourceType).toBe("unknown");
      expect(error.context?.searchAttempted).toBe(true);
    });
  });
});
