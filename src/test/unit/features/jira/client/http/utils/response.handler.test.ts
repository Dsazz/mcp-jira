import { describe, expect, it, mock } from "bun:test";
import { JiraResponseHandler } from "@features/jira/client/http/utils/response.handler";

describe("JiraResponseHandler", () => {
  const handler = new JiraResponseHandler();

  describe("processResponse", () => {
    describe("successful responses", () => {
      it("should process JSON response successfully", async () => {
        const mockData = { id: "TEST-123", summary: "Test issue" };
        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual(mockData);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
      });

      it("should handle complex JSON objects", async () => {
        const mockData = {
          issues: [
            {
              id: "10001",
              key: "TEST-123",
              fields: {
                summary: "Test issue",
                description: "Test description",
                assignee: {
                  displayName: "John Doe",
                  emailAddress: "john@example.com",
                },
                labels: ["bug", "urgent"],
              },
            },
          ],
          total: 1,
          maxResults: 50,
        };

        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual(mockData);
      });

      it("should handle array responses", async () => {
        const mockData = [
          { id: "1", name: "Project A" },
          { id: "2", name: "Project B" },
        ];

        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual(mockData);
      });

      it("should handle string responses", async () => {
        const mockData = "Simple string response";

        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toBe(mockData);
      });

      it("should handle number responses", async () => {
        const mockData = 42;

        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toBe(mockData);
      });

      it("should handle boolean responses", async () => {
        const mockData = true;

        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toBe(mockData);
      });

      it("should handle null responses", async () => {
        const mockData = null;

        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toBe(mockData);
      });
    });

    describe("no content responses", () => {
      it("should handle 204 No Content response", async () => {
        const mockResponse = {
          status: 204,
        } as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual({});
      });

      it("should return empty object for 204 status", async () => {
        const mockResponse = {
          status: 204,
          json: mock(() => Promise.resolve({})), // Should not be called
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual({});
        expect(mockResponse.json).not.toHaveBeenCalled();
      });
    });

    describe("JSON parsing errors", () => {
      it("should throw error when JSON parsing fails", async () => {
        const mockResponse = {
          status: 200,
          json: mock(() => Promise.reject(new Error("Invalid JSON"))),
        } as unknown as Response;

        await expect(handler.processResponse(mockResponse)).rejects.toThrow(
          "Failed to parse JSON response: Invalid JSON",
        );
      });

      it("should handle SyntaxError from JSON parsing", async () => {
        const mockResponse = {
          status: 200,
          json: mock(() => Promise.reject(new SyntaxError("Unexpected token"))),
        } as unknown as Response;

        await expect(handler.processResponse(mockResponse)).rejects.toThrow(
          "Failed to parse JSON response: Unexpected token",
        );
      });

      it("should handle non-Error objects in JSON parsing", async () => {
        const mockResponse = {
          status: 200,
          json: mock(() => Promise.reject("String error")),
        } as unknown as Response;

        await expect(handler.processResponse(mockResponse)).rejects.toThrow(
          "Failed to parse JSON response: String error",
        );
      });

      it("should handle undefined error in JSON parsing", async () => {
        const mockResponse = {
          status: 200,
          json: mock(() => Promise.reject(undefined)),
        } as unknown as Response;

        await expect(handler.processResponse(mockResponse)).rejects.toThrow(
          "Failed to parse JSON response: undefined",
        );
      });
    });

    describe("different status codes", () => {
      it("should process 200 OK responses", async () => {
        const mockData = { success: true };
        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual(mockData);
      });

      it("should process 201 Created responses", async () => {
        const mockData = { id: "NEW-123", created: true };
        const mockResponse = {
          status: 201,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual(mockData);
      });

      it("should process other 2xx responses", async () => {
        const mockData = { updated: true };
        const mockResponse = {
          status: 202,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual(mockData);
      });
    });

    describe("edge cases", () => {
      it("should handle empty JSON object", async () => {
        const mockData = {};
        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual({});
      });

      it("should handle empty array", async () => {
        const mockData: unknown[] = [];
        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual([]);
      });

      it("should handle deeply nested objects", async () => {
        const mockData = {
          level1: {
            level2: {
              level3: {
                level4: {
                  value: "deep value",
                },
              },
            },
          },
        };

        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual(mockData);
      });

      it("should handle objects with special characters", async () => {
        const mockData = {
          "special-key": "value",
          "key with spaces": "another value",
          "key.with.dots": "dot value",
          key_with_underscores: "underscore value",
          "🚀": "emoji key",
        };

        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result = await handler.processResponse(mockResponse);

        expect(result).toEqual(mockData);
      });
    });

    describe("type safety", () => {
      it("should maintain type information for typed responses", async () => {
        interface TestResponse {
          id: string;
          name: string;
          count: number;
        }

        const mockData: TestResponse = {
          id: "test-id",
          name: "test-name",
          count: 42,
        };

        const mockResponse = {
          status: 200,
          json: mock(() => Promise.resolve(mockData)),
        } as unknown as Response;

        const result =
          await handler.processResponse<TestResponse>(mockResponse);

        expect(result.id).toBe("test-id");
        expect(result.name).toBe("test-name");
        expect(result.count).toBe(42);
      });
    });
  });
});
