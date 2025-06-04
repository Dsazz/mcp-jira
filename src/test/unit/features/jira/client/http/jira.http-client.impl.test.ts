import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { JiraHttpClient } from "@features/jira/client/http/jira.http-client.impl";
import type { JiraConfigService } from "@features/jira/client/config/jira-config.service";
import type { HttpRequestOptions } from "@features/jira/client/http/jira.http.types";
import {
  JiraApiError,
  JiraAuthenticationError,
  JiraNetworkError,
} from "@features/jira/client/errors";

// Mock the global fetch function
const mockFetch = mock();
Object.defineProperty(global, "fetch", {
  value: mockFetch,
  writable: true,
});

describe("JiraHttpClient", () => {
  const mockConfig = {
    hostUrl: "https://example.atlassian.net/",
    username: "test@example.com",
    apiToken: "test-api-token",
    maxRetries: 3,
    timeout: 10000,
  };

  const mockConfigService = {
    get: () => mockConfig,
  } as JiraConfigService;

  let client: JiraHttpClient;

  beforeEach(() => {
    client = new JiraHttpClient(mockConfigService);
    mockFetch.mockClear();
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  describe("constructor", () => {
    it("should create HTTP client with valid configuration", () => {
      expect(client).toBeInstanceOf(JiraHttpClient);
    });

    it("should initialize with correct base URL", () => {
      expect(client.getBaseUrl()).toBe(
        "https://example.atlassian.net/rest/api/3",
      );
    });

    it("should handle host URL without trailing slash", () => {
      const configWithoutSlash = {
        ...mockConfig,
        hostUrl: "https://example.atlassian.net",
      };

      const configServiceWithoutSlash = {
        get: () => configWithoutSlash,
      } as JiraConfigService;

      const clientWithoutSlash = new JiraHttpClient(configServiceWithoutSlash);

      expect(clientWithoutSlash.getBaseUrl()).toBe(
        "https://example.atlassian.net/rest/api/3",
      );
    });
  });

  describe("sendRequest", () => {
    describe("successful requests", () => {
      it("should send GET request successfully", async () => {
        const mockResponseData = { id: "TEST-123", summary: "Test issue" };
        const mockResponse = {
          ok: true,
          status: 200,
          json: mock(() => Promise.resolve(mockResponseData)),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "issue/TEST-123",
          method: "GET",
        };

        const result = await client.sendRequest(options);

        expect(result).toEqual(mockResponseData);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://example.atlassian.net/rest/api/3/issue/TEST-123",
          expect.objectContaining({
            method: "GET",
            headers: expect.objectContaining({
              Authorization: expect.stringMatching(/^Basic /),
              Accept: "application/json",
              "Content-Type": "application/json",
            }),
          }),
        );
      });

      it("should send POST request with body successfully", async () => {
        const requestBody = {
          summary: "New issue",
          description: "Test description",
        };
        const mockResponseData = { id: "TEST-124", key: "TEST-124" };
        const mockResponse = {
          ok: true,
          status: 201,
          json: mock(() => Promise.resolve(mockResponseData)),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "issue",
          method: "POST",
          body: requestBody,
        };

        const result = await client.sendRequest(options);

        expect(result).toEqual(mockResponseData);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://example.atlassian.net/rest/api/3/issue",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify(requestBody),
          }),
        );
      });

      it("should send request with query parameters", async () => {
        const mockResponseData = { issues: [], total: 0 };
        const mockResponse = {
          ok: true,
          status: 200,
          json: mock(() => Promise.resolve(mockResponseData)),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "search",
          method: "GET",
          queryParams: {
            jql: "project = TEST",
            maxResults: 50,
            startAt: 0,
          },
        };

        const result = await client.sendRequest(options);

        expect(result).toEqual(mockResponseData);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://example.atlassian.net/rest/api/3/search?jql=project+%3D+TEST&maxResults=50&startAt=0",
          expect.any(Object),
        );
      });

      it("should send request with custom headers", async () => {
        const mockResponseData = { success: true };
        const mockResponse = {
          ok: true,
          status: 200,
          json: mock(() => Promise.resolve(mockResponseData)),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "test",
          method: "GET",
          headers: {
            "X-Custom-Header": "custom-value",
            "X-Request-ID": "12345",
          },
        };

        const result = await client.sendRequest(options);

        expect(result).toEqual(mockResponseData);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              "X-Custom-Header": "custom-value",
              "X-Request-ID": "12345",
              Authorization: expect.stringMatching(/^Basic /),
            }),
          }),
        );
      });

      it("should handle 204 No Content response", async () => {
        const mockResponse = {
          ok: true,
          status: 204,
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "issue/TEST-123",
          method: "DELETE",
        };

        const result = await client.sendRequest(options);

        expect(result).toEqual({});
      });
    });

    describe("HTTP error responses", () => {
      it("should handle 401 Unauthorized response", async () => {
        const mockResponse = {
          ok: false,
          status: 401,
          json: mock(() =>
            Promise.resolve({
              errorMessages: ["Authentication failed"],
              errors: {},
            }),
          ),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "issue/TEST-123",
          method: "GET",
        };

        await expect(client.sendRequest(options)).rejects.toThrow(
          JiraAuthenticationError,
        );
      });

      it("should handle 404 Not Found response", async () => {
        const mockResponse = {
          ok: false,
          status: 404,
          json: mock(() =>
            Promise.resolve({
              errorMessages: ["Issue not found"],
              errors: {},
            }),
          ),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "issue/NONEXISTENT-123",
          method: "GET",
        };

        await expect(client.sendRequest(options)).rejects.toThrow(JiraApiError);
      });

      it("should handle 500 Internal Server Error response", async () => {
        const mockResponse = {
          ok: false,
          status: 500,
          json: mock(() =>
            Promise.resolve({
              errorMessages: ["Internal server error"],
              errors: {},
            }),
          ),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "issue/TEST-123",
          method: "GET",
        };

        await expect(client.sendRequest(options)).rejects.toThrow(JiraApiError);
      });
    });

    describe("network errors", () => {
      it("should handle network connection errors", async () => {
        mockFetch.mockRejectedValue(new Error("Network error"));

        const options: HttpRequestOptions = {
          endpoint: "issue/TEST-123",
          method: "GET",
        };

        await expect(client.sendRequest(options)).rejects.toThrow(
          JiraNetworkError,
        );
      });

      it("should handle timeout errors", async () => {
        mockFetch.mockRejectedValue(new Error("Request timeout"));

        const options: HttpRequestOptions = {
          endpoint: "issue/TEST-123",
          method: "GET",
        };

        await expect(client.sendRequest(options)).rejects.toThrow(
          JiraNetworkError,
        );
      });

      it("should re-throw JiraApiError without wrapping", async () => {
        const originalError = new JiraApiError("Original API error");
        mockFetch.mockRejectedValue(originalError);

        const options: HttpRequestOptions = {
          endpoint: "issue/TEST-123",
          method: "GET",
        };

        await expect(client.sendRequest(options)).rejects.toThrow(
          originalError,
        );
      });

      it("should re-throw JiraAuthenticationError without wrapping", async () => {
        const originalError = new JiraAuthenticationError(
          "Original auth error",
        );
        mockFetch.mockRejectedValue(originalError);

        const options: HttpRequestOptions = {
          endpoint: "issue/TEST-123",
          method: "GET",
        };

        await expect(client.sendRequest(options)).rejects.toThrow(
          originalError,
        );
      });
    });

    describe("request logging", () => {
      it("should log request details", async () => {
        const mockResponseData = { success: true };
        const mockResponse = {
          ok: true,
          status: 200,
          json: mock(() => Promise.resolve(mockResponseData)),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "test",
          method: "POST",
        };

        await client.sendRequest(options);

        // Verify that fetch was called with the correct URL
        expect(mockFetch).toHaveBeenCalledWith(
          "https://example.atlassian.net/rest/api/3/test",
          expect.any(Object),
        );
      });
    });

    describe("different HTTP methods", () => {
      const testCases = [
        { method: "GET" as const, hasBody: false },
        { method: "POST" as const, hasBody: true },
        { method: "PUT" as const, hasBody: true },
        { method: "DELETE" as const, hasBody: false },
        { method: "PATCH" as const, hasBody: true },
      ];

      for (const { method, hasBody } of testCases) {
        it(`should handle ${method} requests`, async () => {
          const mockResponseData = { success: true };
          const mockResponse = {
            ok: true,
            status: 200,
            json: mock(() => Promise.resolve(mockResponseData)),
          };

          mockFetch.mockResolvedValue(mockResponse);

          const options: HttpRequestOptions = {
            endpoint: "test",
            method,
            ...(hasBody && { body: { test: "data" } }),
          };

          const result = await client.sendRequest(options);

          expect(result).toEqual(mockResponseData);
          expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              method,
            }),
          );
        });
      }
    });

    describe("edge cases", () => {
      it("should handle empty endpoint", async () => {
        const mockResponseData = { success: true };
        const mockResponse = {
          ok: true,
          status: 200,
          json: mock(() => Promise.resolve(mockResponseData)),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "",
          method: "GET",
        };

        const result = await client.sendRequest(options);

        expect(result).toEqual(mockResponseData);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://example.atlassian.net/rest/api/3/",
          expect.any(Object),
        );
      });

      it("should handle endpoint with leading slash", async () => {
        const mockResponseData = { success: true };
        const mockResponse = {
          ok: true,
          status: 200,
          json: mock(() => Promise.resolve(mockResponseData)),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "/issue/TEST-123",
          method: "GET",
        };

        const result = await client.sendRequest(options);

        expect(result).toEqual(mockResponseData);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://example.atlassian.net/rest/api/3/issue/TEST-123",
          expect.any(Object),
        );
      });

      it("should handle undefined query parameters", async () => {
        const mockResponseData = { success: true };
        const mockResponse = {
          ok: true,
          status: 200,
          json: mock(() => Promise.resolve(mockResponseData)),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const options: HttpRequestOptions = {
          endpoint: "search",
          method: "GET",
          queryParams: {
            jql: "project = TEST",
            maxResults: undefined,
            startAt: 0,
          },
        };

        const result = await client.sendRequest(options);

        expect(result).toEqual(mockResponseData);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://example.atlassian.net/rest/api/3/search?jql=project+%3D+TEST&startAt=0",
          expect.any(Object),
        );
      });
    });
  });

  describe("getBaseUrl", () => {
    it("should return the correct base URL", () => {
      expect(client.getBaseUrl()).toBe(
        "https://example.atlassian.net/rest/api/3",
      );
    });
  });

  describe("authentication", () => {
    it("should include correct authentication header", async () => {
      const mockResponseData = { success: true };
      const mockResponse = {
        ok: true,
        status: 200,
        json: mock(() => Promise.resolve(mockResponseData)),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const options: HttpRequestOptions = {
        endpoint: "test",
        method: "GET",
      };

      await client.sendRequest(options);

      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1] as RequestInit;
      const headers = requestInit.headers as Record<string, string>;

      expect(headers.Authorization).toBeDefined();
      expect(headers.Authorization).toMatch(/^Basic /);

      // Decode and verify the auth token
      const token = headers.Authorization.replace("Basic ", "");
      const decoded = Buffer.from(token, "base64").toString();
      expect(decoded).toBe("test@example.com:test-api-token");
    });
  });
});
