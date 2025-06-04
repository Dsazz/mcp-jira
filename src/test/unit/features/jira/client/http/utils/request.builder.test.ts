import { describe, expect, it } from "bun:test";
import {
  JiraRequestBuilder,
  type RequestBuilderConfig,
} from "@features/jira/client/http/utils/request.builder";

describe("JiraRequestBuilder", () => {
  const mockConfig: RequestBuilderConfig = {
    username: "test@example.com",
    apiToken: "test-api-token-123",
  };

  describe("constructor", () => {
    it("should create request builder with valid config", () => {
      const builder = new JiraRequestBuilder(mockConfig);

      expect(builder).toBeInstanceOf(JiraRequestBuilder);
    });
  });

  describe("createRequestParams", () => {
    const builder = new JiraRequestBuilder(mockConfig);

    describe("basic functionality", () => {
      it("should create request params with GET method", () => {
        const params = builder.createRequestParams("GET");

        expect(params.method).toBe("GET");
        expect(params.headers).toBeDefined();
        expect(params.body).toBeUndefined();
      });

      it("should create request params with POST method", () => {
        const params = builder.createRequestParams("POST");

        expect(params.method).toBe("POST");
        expect(params.headers).toBeDefined();
        expect(params.body).toBeUndefined();
      });

      it("should create request params with PUT method", () => {
        const params = builder.createRequestParams("PUT");

        expect(params.method).toBe("PUT");
        expect(params.headers).toBeDefined();
        expect(params.body).toBeUndefined();
      });

      it("should create request params with DELETE method", () => {
        const params = builder.createRequestParams("DELETE");

        expect(params.method).toBe("DELETE");
        expect(params.headers).toBeDefined();
        expect(params.body).toBeUndefined();
      });
    });

    describe("authentication headers", () => {
      it("should include basic authentication header", () => {
        const params = builder.createRequestParams("GET");
        const headers = params.headers as Record<string, string>;

        expect(headers.Authorization).toBeDefined();
        expect(headers.Authorization).toMatch(/^Basic /);
      });

      it("should create correct basic auth token", () => {
        const params = builder.createRequestParams("GET");
        const headers = params.headers as Record<string, string>;

        // Decode the base64 token to verify it's correct
        const token = headers.Authorization.replace("Basic ", "");
        const decoded = Buffer.from(token, "base64").toString();

        expect(decoded).toBe("test@example.com:test-api-token-123");
      });
    });

    describe("default headers", () => {
      it("should include default Accept header", () => {
        const params = builder.createRequestParams("GET");
        const headers = params.headers as Record<string, string>;

        expect(headers.Accept).toBe("application/json");
      });

      it("should include default Content-Type header", () => {
        const params = builder.createRequestParams("GET");
        const headers = params.headers as Record<string, string>;

        expect(headers["Content-Type"]).toBe("application/json");
      });
    });

    describe("custom headers", () => {
      it("should merge custom headers with defaults", () => {
        const customHeaders = {
          "X-Custom-Header": "custom-value",
          "X-Another-Header": "another-value",
        };

        const params = builder.createRequestParams("GET", customHeaders);
        const headers = params.headers as Record<string, string>;

        expect(headers["X-Custom-Header"]).toBe("custom-value");
        expect(headers["X-Another-Header"]).toBe("another-value");
        expect(headers.Accept).toBe("application/json");
        expect(headers.Authorization).toBeDefined();
      });

      it("should allow custom headers to override defaults", () => {
        const customHeaders = {
          Accept: "application/xml",
          "Content-Type": "text/plain",
        };

        const params = builder.createRequestParams("GET", customHeaders);
        const headers = params.headers as Record<string, string>;

        expect(headers.Accept).toBe("application/xml");
        expect(headers["Content-Type"]).toBe("text/plain");
        expect(headers.Authorization).toBeDefined(); // Should not override auth
      });

      it("should handle empty custom headers", () => {
        const params = builder.createRequestParams("GET", {});
        const headers = params.headers as Record<string, string>;

        expect(headers.Accept).toBe("application/json");
        expect(headers["Content-Type"]).toBe("application/json");
        expect(headers.Authorization).toBeDefined();
      });
    });

    describe("request body handling", () => {
      it("should serialize object body to JSON", () => {
        const body = { key: "value", number: 123 };
        const params = builder.createRequestParams("POST", {}, body);

        expect(params.body).toBe('{"key":"value","number":123}');
      });

      it("should serialize array body to JSON", () => {
        const body = [{ id: 1 }, { id: 2 }];
        const params = builder.createRequestParams("POST", {}, body);

        expect(params.body).toBe('[{"id":1},{"id":2}]');
      });

      it("should serialize string body to JSON", () => {
        const body = "test string";
        const params = builder.createRequestParams("POST", {}, body);

        expect(params.body).toBe('"test string"');
      });

      it("should serialize number body to JSON", () => {
        const body = 42;
        const params = builder.createRequestParams("POST", {}, body);

        expect(params.body).toBe("42");
      });

      it("should serialize boolean body to JSON", () => {
        const body = true;
        const params = builder.createRequestParams("POST", {}, body);

        expect(params.body).toBe("true");
      });

      it("should handle null body", () => {
        const body = null;
        const params = builder.createRequestParams("POST", {}, body);

        expect(params.body).toBe("null");
      });

      it("should handle undefined body", () => {
        const params = builder.createRequestParams("POST", {}, undefined);

        expect(params.body).toBeUndefined();
      });

      it("should handle complex nested objects", () => {
        const body = {
          user: {
            name: "John Doe",
            preferences: {
              theme: "dark",
              notifications: true,
            },
          },
          issues: [
            { key: "TEST-1", status: "Open" },
            { key: "TEST-2", status: "Closed" },
          ],
        };

        const params = builder.createRequestParams("POST", {}, body);
        const parsedBody = JSON.parse(params.body as string);

        expect(parsedBody).toEqual(body);
      });
    });

    describe("complete request scenarios", () => {
      it("should create complete GET request params", () => {
        const params = builder.createRequestParams("GET");

        expect(params).toEqual({
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: expect.stringMatching(/^Basic /),
          },
          body: undefined,
        });
      });

      it("should create complete POST request params with body", () => {
        const body = { summary: "Test issue", description: "Test description" };
        const customHeaders = { "X-Request-ID": "12345" };

        const params = builder.createRequestParams("POST", customHeaders, body);

        expect(params).toEqual({
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: expect.stringMatching(/^Basic /),
            "X-Request-ID": "12345",
          },
          body: JSON.stringify(body),
        });
      });

      it("should create complete PUT request params", () => {
        const body = { status: "In Progress" };

        const params = builder.createRequestParams("PUT", {}, body);

        expect(params).toEqual({
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: expect.stringMatching(/^Basic /),
          },
          body: JSON.stringify(body),
        });
      });
    });
  });

  describe("different configurations", () => {
    it("should handle different username formats", () => {
      const configs = [
        { username: "user@domain.com", apiToken: "token" },
        { username: "username", apiToken: "token" },
        { username: "user.name@company.org", apiToken: "token" },
      ];

      for (const config of configs) {
        const builder = new JiraRequestBuilder(config);
        const params = builder.createRequestParams("GET");
        const headers = params.headers as Record<string, string>;

        expect(headers.Authorization).toBeDefined();
        expect(headers.Authorization).toMatch(/^Basic /);
      }
    });

    it("should handle different API token formats", () => {
      const configs = [
        { username: "user", apiToken: "simple-token" },
        { username: "user", apiToken: "ATATT3xFfGF0T..." }, // Atlassian format
        {
          username: "user",
          apiToken: "very-long-token-with-special-chars-123!@#",
        },
      ];

      for (const config of configs) {
        const builder = new JiraRequestBuilder(config);
        const params = builder.createRequestParams("GET");
        const headers = params.headers as Record<string, string>;

        expect(headers.Authorization).toBeDefined();
        expect(headers.Authorization).toMatch(/^Basic /);
      }
    });
  });
});
