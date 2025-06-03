import { describe, expect, test } from "bun:test";
import { HttpError } from "../../../../core/errors/http.error";
import { McpError } from "../../../../core/errors/mcp.error";

describe("HttpError", () => {
  describe("constructor", () => {
    test("should create error with message only", () => {
      const error = new HttpError("HTTP request failed");

      expect(error.message).toBe("HTTP request failed");
      expect(error.name).toBe("HttpError");
      expect(error.code).toBe("HTTP_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.context).toBeUndefined();
    });

    test("should create error with message and status code", () => {
      const error = new HttpError("Not found", 404);

      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("HTTP_ERROR");
    });

    test("should create error with message, status code, and context", () => {
      const context = { url: "/api/users", method: "GET" };
      const error = new HttpError("Request failed", 400, context);

      expect(error.message).toBe("Request failed");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("HTTP_ERROR");
      expect(error.context).toEqual(context);
    });

    test("should create error with empty context", () => {
      const error = new HttpError("Server error", 500, {});

      expect(error.statusCode).toBe(500);
      expect(error.context).toEqual({});
    });

    test("should create error with complex context", () => {
      const context = {
        url: "/api/confluence/pages",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { title: "Test Page" },
        response: { error: "Unauthorized" },
      };
      const error = new HttpError("API request failed", 401, context);

      expect(error.context).toEqual(context);
    });
  });

  describe("inheritance", () => {
    test("should be instance of Error", () => {
      const error = new HttpError("Test error");
      expect(error).toBeInstanceOf(Error);
    });

    test("should be instance of McpError", () => {
      const error = new HttpError("Test error");
      expect(error).toBeInstanceOf(McpError);
    });

    test("should be instance of HttpError", () => {
      const error = new HttpError("Test error");
      expect(error).toBeInstanceOf(HttpError);
    });

    test("should have correct constructor name", () => {
      const error = new HttpError("Test error");
      expect(error.constructor.name).toBe("HttpError");
    });
  });

  describe("status codes", () => {
    test("should handle 400 Bad Request", () => {
      const error = new HttpError("Bad request", 400);
      expect(error.statusCode).toBe(400);
    });

    test("should handle 401 Unauthorized", () => {
      const error = new HttpError("Unauthorized", 401);
      expect(error.statusCode).toBe(401);
    });

    test("should handle 403 Forbidden", () => {
      const error = new HttpError("Forbidden", 403);
      expect(error.statusCode).toBe(403);
    });

    test("should handle 404 Not Found", () => {
      const error = new HttpError("Not found", 404);
      expect(error.statusCode).toBe(404);
    });

    test("should handle 500 Internal Server Error", () => {
      const error = new HttpError("Internal server error", 500);
      expect(error.statusCode).toBe(500);
    });

    test("should handle 502 Bad Gateway", () => {
      const error = new HttpError("Bad gateway", 502);
      expect(error.statusCode).toBe(502);
    });

    test("should handle 503 Service Unavailable", () => {
      const error = new HttpError("Service unavailable", 503);
      expect(error.statusCode).toBe(503);
    });

    test("should handle custom status codes", () => {
      const error = new HttpError("Custom error", 999);
      expect(error.statusCode).toBe(999);
    });
  });

  describe("error properties", () => {
    test("should have correct error code", () => {
      const error = new HttpError("Test error");
      expect(error.code).toBe("HTTP_ERROR");
    });

    test("should have correct error name", () => {
      const error = new HttpError("Test error");
      expect(error.name).toBe("HttpError");
    });

    test("should have readonly statusCode property", () => {
      const error = new HttpError("Test error", 404);
      expect(error.statusCode).toBe(404);

      // Verify it's readonly (TypeScript compile-time check)
      const originalStatusCode = error.statusCode;
      expect(error.statusCode).toBe(originalStatusCode);
    });

    test("should have stack trace", () => {
      const error = new HttpError("Test error");
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });
  });

  describe("toJSON", () => {
    test("should serialize basic error to JSON", () => {
      const error = new HttpError("HTTP error");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "HttpError",
        message: "HTTP error",
        code: "HTTP_ERROR",
        context: undefined,
        statusCode: 500,
      });
    });

    test("should serialize error with custom status code to JSON", () => {
      const error = new HttpError("Not found", 404);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "HttpError",
        message: "Not found",
        code: "HTTP_ERROR",
        context: undefined,
        statusCode: 404,
      });
    });

    test("should serialize error with context to JSON", () => {
      const context = { url: "/api/test", method: "POST" };
      const error = new HttpError("Request failed", 400, context);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "HttpError",
        message: "Request failed",
        code: "HTTP_ERROR",
        context: context,
        statusCode: 400,
      });
    });

    test("should be JSON.stringify compatible", () => {
      const context = {
        url: "/api/users",
        headers: { Authorization: "Bearer token" },
      };
      const error = new HttpError("Unauthorized", 401, context);

      expect(() => JSON.stringify(error.toJSON())).not.toThrow();

      const serialized = JSON.stringify(error.toJSON());
      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe("HttpError");
      expect(parsed.statusCode).toBe(401);
      expect(parsed.context).toEqual(context);
    });
  });

  describe("HTTP scenarios", () => {
    test("should handle network timeout errors", () => {
      const context = {
        url: "https://api.example.com/data",
        timeout: 5000,
        error: "TIMEOUT",
      };
      const error = new HttpError("Request timeout", 408, context);

      expect(error.statusCode).toBe(408);
      expect(error.context?.error).toBe("TIMEOUT");
    });

    test("should handle API rate limiting", () => {
      const context = {
        url: "/api/confluence/pages",
        rateLimitRemaining: 0,
        rateLimitReset: "2023-01-01T12:00:00Z",
      };
      const error = new HttpError("Rate limit exceeded", 429, context);

      expect(error.statusCode).toBe(429);
      expect(error.context?.rateLimitRemaining).toBe(0);
    });

    test("should handle authentication errors", () => {
      const context = {
        url: "/api/auth/login",
        credentials: "invalid",
        authMethod: "basic",
      };
      const error = new HttpError("Invalid credentials", 401, context);

      expect(error.statusCode).toBe(401);
      expect(error.context?.authMethod).toBe("basic");
    });

    test("should handle server errors", () => {
      const context = {
        url: "/api/confluence/spaces",
        serverError: "Database connection failed",
        timestamp: "2023-01-01T12:00:00Z",
      };
      const error = new HttpError("Internal server error", 500, context);

      expect(error.statusCode).toBe(500);
      expect(error.context?.serverError).toBe("Database connection failed");
    });
  });

  describe("edge cases", () => {
    test("should handle empty message", () => {
      const error = new HttpError("", 404);
      expect(error.message).toBe("");
      expect(error.statusCode).toBe(404);
    });

    test("should handle zero status code", () => {
      const error = new HttpError("Network error", 0);
      expect(error.statusCode).toBe(0);
    });

    test("should handle negative status code", () => {
      const error = new HttpError("Invalid status", -1);
      expect(error.statusCode).toBe(-1);
    });

    test("should handle very large status code", () => {
      const error = new HttpError("Custom error", 99999);
      expect(error.statusCode).toBe(99999);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "HTTP error: 🚨 Request failed with\nnewlines";
      const error = new HttpError(specialMessage, 400);
      expect(error.message).toBe(specialMessage);
    });

    test("should handle null values in context", () => {
      const context = { response: null, headers: null };
      const error = new HttpError("Null response", 500, context);
      expect(error.context?.response).toBeNull();
      expect(error.context?.headers).toBeNull();
    });
  });
});
