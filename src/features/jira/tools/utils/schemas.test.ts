/**
 * Search Schemas Tests
 * 
 * Tests for JIRA search parameter validation and JQL building
 */
import { describe, it, expect } from "bun:test";
import { 
  searchJiraIssuesSchema, 
  buildJQLFromHelpers, 
  issueKeySchema,
  type SearchJiraIssuesParams 
} from "./schemas";

describe("JIRA Schemas", () => {
  describe("issueKeySchema", () => {
    it("should validate correct issue keys", () => {
      expect(issueKeySchema.parse("PROJ-123")).toBe("PROJ-123");
      expect(issueKeySchema.parse("ABC-1")).toBe("ABC-1");
      expect(issueKeySchema.parse("LONGPROJECT-999999")).toBe("LONGPROJECT-999999");
    });

    it("should reject invalid issue keys", () => {
      expect(() => issueKeySchema.parse("proj-123")).toThrow();
      expect(() => issueKeySchema.parse("PROJ123")).toThrow();
      expect(() => issueKeySchema.parse("123-PROJ")).toThrow();
      expect(() => issueKeySchema.parse("PROJ-")).toThrow();
      expect(() => issueKeySchema.parse("-123")).toThrow();
    });
  });

  describe("searchJiraIssuesSchema", () => {
    it("should accept JQL query", () => {
      const params = {
        jql: "project = PROJ AND status = Open"
      };
      
      const result = searchJiraIssuesSchema.parse(params);
      expect(result.jql).toBe("project = PROJ AND status = Open");
      expect(result.maxResults).toBe(25); // default
    });

    it("should accept helper parameters", () => {
      const params = {
        assignedToMe: true,
        project: "PROJ",
        status: "In Progress",
        text: "search term"
      };
      
      const result = searchJiraIssuesSchema.parse(params);
      expect(result.assignedToMe).toBe(true);
      expect(result.project).toBe("PROJ");
      expect(result.status).toBe("In Progress");
      expect(result.text).toBe("search term");
    });

    it("should accept status as array", () => {
      const params = {
        status: ["Open", "In Progress", "Done"]
      };
      
      const result = searchJiraIssuesSchema.parse(params);
      expect(result.status).toEqual(["Open", "In Progress", "Done"]);
    });

    it("should set default maxResults", () => {
      const params = { assignedToMe: true };
      const result = searchJiraIssuesSchema.parse(params);
      expect(result.maxResults).toBe(25);
    });

    it("should accept custom maxResults", () => {
      const params = { 
        assignedToMe: true,
        maxResults: 10
      };
      const result = searchJiraIssuesSchema.parse(params);
      expect(result.maxResults).toBe(10);
    });

    it("should accept custom fields", () => {
      const params = { 
        assignedToMe: true,
        fields: ["summary", "status", "assignee"]
      };
      const result = searchJiraIssuesSchema.parse(params);
      expect(result.fields).toEqual(["summary", "status", "assignee"]);
    });

    it("should reject empty parameters", () => {
      expect(() => searchJiraIssuesSchema.parse({})).toThrow();
    });

    it("should reject maxResults out of range", () => {
      expect(() => searchJiraIssuesSchema.parse({
        assignedToMe: true,
        maxResults: 0
      })).toThrow();

      expect(() => searchJiraIssuesSchema.parse({
        assignedToMe: true, 
        maxResults: 51
      })).toThrow();
    });

    it("should reject empty JQL string", () => {
      expect(() => searchJiraIssuesSchema.parse({
        jql: ""
      })).toThrow();
    });
  });

  describe("buildJQLFromHelpers", () => {
    it("should use provided JQL directly", () => {
      const params: SearchJiraIssuesParams = {
        jql: "project = PROJ AND status = Open",
        maxResults: 25
      };
      
      expect(buildJQLFromHelpers(params)).toBe("project = PROJ AND status = Open");
    });

    it("should build JQL for assignedToMe", () => {
      const params: SearchJiraIssuesParams = {
        assignedToMe: true,
        maxResults: 25
      };
      
      expect(buildJQLFromHelpers(params)).toBe("assignee = currentUser() ORDER BY updated DESC");
    });

    it("should build JQL for project", () => {
      const params: SearchJiraIssuesParams = {
        project: "PROJ",
        maxResults: 25
      };
      
      expect(buildJQLFromHelpers(params)).toBe('project = "PROJ" ORDER BY updated DESC');
    });

    it("should build JQL for single status", () => {
      const params: SearchJiraIssuesParams = {
        status: "In Progress",
        maxResults: 25
      };
      
      expect(buildJQLFromHelpers(params)).toBe('status IN ("In Progress") ORDER BY updated DESC');
    });

    it("should build JQL for multiple statuses", () => {
      const params: SearchJiraIssuesParams = {
        status: ["Open", "In Progress", "Done"],
        maxResults: 25
      };
      
      expect(buildJQLFromHelpers(params)).toBe('status IN ("Open", "In Progress", "Done") ORDER BY updated DESC');
    });

    it("should build JQL for text search", () => {
      const params: SearchJiraIssuesParams = {
        text: "bug fix",
        maxResults: 25
      };
      
      expect(buildJQLFromHelpers(params)).toBe('(summary ~ "bug fix" OR description ~ "bug fix") ORDER BY updated DESC');
    });

    it("should combine multiple helper parameters", () => {
      const params: SearchJiraIssuesParams = {
        assignedToMe: true,
        project: "PROJ",
        status: ["Open", "In Progress"],
        text: "urgent",
        maxResults: 25
      };
      
      const jql = buildJQLFromHelpers(params);
      expect(jql).toContain("assignee = currentUser()");
      expect(jql).toContain('project = "PROJ"');
      expect(jql).toContain('status IN ("Open", "In Progress")');
      expect(jql).toContain('(summary ~ "urgent" OR description ~ "urgent")');
      expect(jql).toContain("ORDER BY updated DESC");
      
      // Should be properly AND-ed together
      const conditions = jql.split(" ORDER BY")[0].split(" AND ");
      expect(conditions).toHaveLength(4);
    });

    it("should handle special characters in text search", () => {
      const params: SearchJiraIssuesParams = {
        text: 'search "with quotes"',
        maxResults: 25
      };
      
      expect(buildJQLFromHelpers(params)).toBe('(summary ~ "search \\"with quotes\\"" OR description ~ "search \\"with quotes\\"") ORDER BY updated DESC');
    });

    it("should handle special characters in project name", () => {
      const params: SearchJiraIssuesParams = {
        project: "PROJ-NAME",
        maxResults: 25
      };
      
      expect(buildJQLFromHelpers(params)).toBe('project = "PROJ-NAME" ORDER BY updated DESC');
    });
  });
}); 