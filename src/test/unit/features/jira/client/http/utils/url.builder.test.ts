import { describe, expect, it } from "bun:test";
import { JiraUrlBuilder } from "@features/jira/client/http/utils/url.builder";

describe("JiraUrlBuilder", () => {
  describe("constructor", () => {
    it("should create base URL with trailing slash in host URL", () => {
      const builder = new JiraUrlBuilder("https://example.atlassian.net/");

      expect(builder.getBaseUrl()).toBe(
        "https://example.atlassian.net/rest/api/3",
      );
    });

    it("should create base URL without trailing slash in host URL", () => {
      const builder = new JiraUrlBuilder("https://example.atlassian.net");

      expect(builder.getBaseUrl()).toBe(
        "https://example.atlassian.net/rest/api/3",
      );
    });

    it("should handle host URL with multiple trailing slashes", () => {
      const builder = new JiraUrlBuilder("https://example.atlassian.net///");

      expect(builder.getBaseUrl()).toBe(
        "https://example.atlassian.net///rest/api/3",
      );
    });
  });

  describe("buildUrl", () => {
    const builder = new JiraUrlBuilder("https://example.atlassian.net");

    describe("endpoint handling", () => {
      it("should build URL with simple endpoint", () => {
        const url = builder.buildUrl("issue/TEST-123");

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/issue/TEST-123",
        );
      });

      it("should build URL with endpoint starting with slash", () => {
        const url = builder.buildUrl("/issue/TEST-123");

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/issue/TEST-123",
        );
      });

      it("should build URL with nested endpoint", () => {
        const url = builder.buildUrl("project/TEST/versions");

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/project/TEST/versions",
        );
      });

      it("should handle empty endpoint", () => {
        const url = builder.buildUrl("");

        expect(url).toBe("https://example.atlassian.net/rest/api/3/");
      });

      it("should handle endpoint with multiple leading slashes", () => {
        const url = builder.buildUrl("///issue/TEST-123");

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/issue/TEST-123",
        );
      });
    });

    describe("query parameters", () => {
      it("should build URL without query parameters", () => {
        const url = builder.buildUrl("search");

        expect(url).toBe("https://example.atlassian.net/rest/api/3/search");
      });

      it("should build URL with single query parameter", () => {
        const url = builder.buildUrl("search", { jql: "project = TEST" });

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/search?jql=project+%3D+TEST",
        );
      });

      it("should build URL with multiple query parameters", () => {
        const url = builder.buildUrl("search", {
          jql: "project = TEST",
          maxResults: 50,
          startAt: 0,
        });

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/search?jql=project+%3D+TEST&maxResults=50&startAt=0",
        );
      });

      it("should build URL with boolean query parameters", () => {
        const url = builder.buildUrl("search", {
          expand: true,
          validateQuery: false,
        });

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/search?expand=true&validateQuery=false",
        );
      });

      it("should skip undefined query parameters", () => {
        const url = builder.buildUrl("search", {
          jql: "project = TEST",
          maxResults: undefined,
          startAt: 0,
        });

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/search?jql=project+%3D+TEST&startAt=0",
        );
      });

      it("should handle empty query parameters object", () => {
        const url = builder.buildUrl("search", {});

        expect(url).toBe("https://example.atlassian.net/rest/api/3/search");
      });

      it("should handle query parameters with special characters", () => {
        const url = builder.buildUrl("search", {
          jql: 'summary ~ "test & development"',
        });

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/search?jql=summary+%7E+%22test+%26+development%22",
        );
      });

      it("should handle numeric query parameters", () => {
        const url = builder.buildUrl("search", {
          maxResults: 100,
          startAt: 25,
        });

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/search?maxResults=100&startAt=25",
        );
      });
    });

    describe("edge cases", () => {
      it("should handle endpoint with query parameters but no query object", () => {
        const url = builder.buildUrl("search?existing=param");

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/search?existing=param",
        );
      });

      it("should handle complex endpoint paths", () => {
        const url = builder.buildUrl("issue/TEST-123/worklog/12345");

        expect(url).toBe(
          "https://example.atlassian.net/rest/api/3/issue/TEST-123/worklog/12345",
        );
      });
    });
  });

  describe("getBaseUrl", () => {
    it("should return the constructed base URL", () => {
      const builder = new JiraUrlBuilder("https://test.atlassian.net");

      expect(builder.getBaseUrl()).toBe(
        "https://test.atlassian.net/rest/api/3",
      );
    });
  });

  describe("different host URL formats", () => {
    it("should handle localhost URLs", () => {
      const builder = new JiraUrlBuilder("http://localhost:8080");

      expect(builder.getBaseUrl()).toBe("http://localhost:8080/rest/api/3");
    });

    it("should handle IP address URLs", () => {
      const builder = new JiraUrlBuilder("http://192.168.1.100:8080");

      expect(builder.getBaseUrl()).toBe("http://192.168.1.100:8080/rest/api/3");
    });

    it("should handle custom domain URLs", () => {
      const builder = new JiraUrlBuilder("https://jira.company.com");

      expect(builder.getBaseUrl()).toBe("https://jira.company.com/rest/api/3");
    });

    it("should handle URLs with paths", () => {
      const builder = new JiraUrlBuilder("https://company.com/jira");

      expect(builder.getBaseUrl()).toBe("https://company.com/jira/rest/api/3");
    });
  });
});
