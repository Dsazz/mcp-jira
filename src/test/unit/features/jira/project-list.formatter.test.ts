/**
 * Project List Formatter Tests
 * Tests for the project list formatting functionality
 */

import { beforeEach, describe, expect, test } from "bun:test";
import {
  type ProjectListContext,
  ProjectListFormatter,
} from "@features/jira/formatters/project-list.formatter";
import type { Project } from "@features/jira/repositories/project.types";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("ProjectListFormatter", () => {
  let formatter: ProjectListFormatter;

  beforeEach(() => {
    formatter = new ProjectListFormatter();
  });

  describe("format method", () => {
    test("should format complete project list correctly", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "TEST",
          name: "Test Project",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
          lead: mockFactory.createMockUser({
            accountId: "123",
            displayName: "John Lead",
          }),
          projectCategory: {
            id: "10000",
            name: "Development",
            description: "Development projects",
          },
          description: "A comprehensive test project for development",
          components: [
            { id: "10001", name: "Frontend" },
            { id: "10002", name: "Backend" },
            { id: "10003", name: "API" },
          ],
          versions: [
            { id: "10001", name: "v1.0.0", released: true, archived: false },
            { id: "10002", name: "v1.1.0", released: false, archived: false },
            { id: "10003", name: "v2.0.0", released: false, archived: false },
          ],
          issueTypes: [
            { id: "10001", name: "Bug", subtask: false },
            { id: "10002", name: "Story", subtask: false },
            { id: "10003", name: "Task", subtask: false },
            { id: "10004", name: "Epic", subtask: false },
          ],
        },
        {
          id: "10002",
          key: "DEMO",
          name: "Demo Project",
          projectTypeKey: "business",
          description: "Demo project for showcasing features",
          isPrivate: true,
          simplified: true,
          style: "next-gen",
        },
      ];

      const context: ProjectListContext = {
        totalCount: 2,
        hasMore: false,
        searchQuery: "test",
        filterApplied: true,
        orderBy: "name",
      };

      const result = formatter.format(projects, context);

      expect(result).toContain('# 📋 JIRA Projects - Search: "test"');
      expect(result).toContain("**Found 2 projects**");
      expect(result).toContain("*(filtered)*");
      expect(result).toContain("*Ordered by: name*");
      expect(result).toContain("## 1. **TEST** - Test Project");
      expect(result).toContain("`software`");
      expect(result).toContain(
        "*A comprehensive test project for development*",
      );
      expect(result).toContain("**Lead:** John Lead");
      expect(result).toContain("**Category:** Development");
      expect(result).toContain("**Components:** 3 components");
      expect(result).toContain("**Versions:** 3 total (1 released)");
      expect(result).toContain("**Issue Types:** Bug, Story, Task (+1 more)");
      expect(result).toContain("## 2. **DEMO** - Demo Project");
      expect(result).toContain("`business`");
      expect(result).toContain("`🔒 Private`");
      expect(result).toContain("`⚡ Simplified`");
      expect(result).toContain("[View Project]");
      expect(result).toContain("[Browse Issues]");
      expect(result).toContain("[Project Settings]");
      expect(result).toContain("## 🚀 Next Actions");
      expect(result).toContain("## 💡 Tips");
    });

    test("should handle empty project list", () => {
      const projects: Project[] = [];
      const context: ProjectListContext = {
        searchQuery: "nonexistent",
        filterApplied: true,
      };

      const result = formatter.format(projects, context);

      expect(result).toContain("📋 No Projects Found");
      expect(result).toContain('No projects found matching "nonexistent"');
      expect(result).toContain("Check your search query for typos");
      expect(result).toContain("Try broader search terms");
      expect(result).toContain("Remove filters to see all accessible projects");
      expect(result).toContain("Contact your JIRA administrator");
    });

    test("should format minimal project data", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "MIN",
          name: "Minimal Project",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("📋 JIRA Projects");
      expect(result).toContain("Found 1 project");
      expect(result).toContain("1. **MIN** - Minimal Project");
      expect(result).toContain("`software`");
      expect(result).toContain("[View Project]");
      expect(result).toContain("🚀 Next Actions");
    });

    test("should handle missing optional fields", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "PARTIAL",
          name: "Partial Project",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
          description: undefined,
          lead: undefined,
          projectCategory: undefined,
          components: undefined,
          versions: undefined,
          issueTypes: undefined,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("1. **PARTIAL** - Partial Project");
      expect(result).toContain("`software`");
      expect(result).not.toContain("**Lead:**");
      expect(result).not.toContain("**Category:**");
      expect(result).not.toContain("**Components:**");
      expect(result).not.toContain("**Versions:**");
      expect(result).not.toContain("**Issue Types:**");
    });

    test("should handle empty arrays", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "EMPTY",
          name: "Empty Arrays Project",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
          components: [],
          versions: [],
          issueTypes: [],
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("1. **EMPTY** - Empty Arrays Project");
      expect(result).not.toContain("**Components:**");
      expect(result).not.toContain("**Versions:**");
      expect(result).not.toContain("**Issue Types:**");
    });

    test("should handle single component/version/issue type", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "SINGLE",
          name: "Single Items Project",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
          components: [{ id: "10001", name: "Frontend" }],
          versions: [
            { id: "10001", name: "v1.0.0", released: true, archived: false },
          ],
          issueTypes: [{ id: "10001", name: "Bug", subtask: false }],
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("**Components:** 1 component");
      expect(result).toContain("**Versions:** 1 total (1 released)");
      expect(result).toContain("**Issue Types:** Bug");
    });

    test("should handle many issue types with truncation", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "MANY",
          name: "Many Issue Types Project",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
          issueTypes: [
            { id: "1", name: "Bug", subtask: false },
            { id: "2", name: "Story", subtask: false },
            { id: "3", name: "Task", subtask: false },
            { id: "4", name: "Epic", subtask: false },
            { id: "5", name: "Subtask", subtask: true },
            { id: "6", name: "Improvement", subtask: false },
          ],
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("**Issue Types:** Bug, Story, Task (+3 more)");
    });

    test("should handle versions with no released versions", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "UNRELEASED",
          name: "Unreleased Versions Project",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
          versions: [
            { id: "10001", name: "v1.0.0", released: false, archived: false },
            { id: "10002", name: "v2.0.0", released: false, archived: false },
          ],
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("**Versions:** 2 total (0 released)");
    });

    test("should handle all project badges", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "BADGES",
          name: "All Badges Project",
          projectTypeKey: "business",
          simplified: true,
          style: "next-gen",
          isPrivate: true,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("`business` `🔒 Private` `⚡ Simplified`");
    });

    test("should handle long description", () => {
      const longDescription =
        "This is a very long project description that contains multiple sentences and detailed information about the project scope, objectives, and implementation details that might need to be displayed properly in the formatted output.";

      const projects: Project[] = [
        {
          id: "10001",
          key: "LONG",
          name: "Long Description Project",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
          description: longDescription,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain(longDescription);
    });
  });

  describe("context handling", () => {
    test("should handle search query context", () => {
      const projects: Project[] = [
        mockFactory.createMockProject({
          key: "SEARCH",
          name: "Search Test Project",
        }),
      ];

      const context: ProjectListContext = {
        searchQuery: "search test",
      };

      const result = formatter.format(projects, context);

      expect(result).toContain('📋 JIRA Projects - Search: "search test"');
    });

    test("should handle pagination context", () => {
      const projects: Project[] = [
        mockFactory.createMockProject({ key: "PAGE1", name: "Page Project 1" }),
        mockFactory.createMockProject({ key: "PAGE2", name: "Page Project 2" }),
      ];

      const context: ProjectListContext = {
        totalCount: 10,
        hasMore: true,
      };

      const result = formatter.format(projects, context);

      expect(result).toContain("Found 2 projects (showing 2 of 10)");
      expect(result).toContain("📄 **More projects available**");
      expect(result).toContain("Use `startAt` parameter to load more results");
    });

    test("should handle filter applied context", () => {
      const projects: Project[] = [
        mockFactory.createMockProject({
          key: "FILTER",
          name: "Filtered Project",
        }),
      ];

      const context: ProjectListContext = {
        filterApplied: true,
        orderBy: "key",
      };

      const result = formatter.format(projects, context);

      expect(result).toContain("*(filtered)*");
      expect(result).toContain("*Ordered by: key*");
    });

    test("should handle empty context", () => {
      const projects: Project[] = [
        mockFactory.createMockProject({
          key: "EMPTY",
          name: "Empty Context Project",
        }),
      ];

      const result = formatter.format(projects, {});

      expect(result).toContain("📋 JIRA Projects");
      expect(result).toContain("Found 1 project");
      expect(result).not.toContain("*(filtered)*");
      expect(result).not.toContain("*Ordered by:");
    });

    test("should handle undefined context", () => {
      const projects: Project[] = [
        mockFactory.createMockProject({
          key: "UNDEF",
          name: "Undefined Context Project",
        }),
      ];

      const result = formatter.format(projects);

      expect(result).toContain("📋 JIRA Projects");
      expect(result).toContain("Found 1 project");
    });
  });

  describe("URL generation", () => {
    test("should generate correct project URLs", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "URL-TEST",
          name: "URL Test Project",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("[View Project](#jira-project-URL-TEST)");
      expect(result).toContain("[Browse Issues](#jira-issues-URL-TEST)");
      expect(result).toContain("[Project Settings](#jira-settings-URL-TEST)");
    });

    test("should handle projects with special characters in names", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "SPECIAL",
          name: "Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain(
        "**SPECIAL** - Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
      );
    });

    test("should handle projects with very long names", () => {
      const longName =
        "This is a very long project name that might cause formatting issues if not handled properly in the display logic";

      const projects: Project[] = [
        {
          id: "10001",
          key: "LONG",
          name: longName,
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain(longName);
    });

    test("should handle missing project type", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "NOTYPE",
          name: "No Type Project",
          projectTypeKey: "unknown",
          simplified: false,
          style: "classic",
          isPrivate: false,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("1. **NOTYPE** - No Type Project");
      expect(result).toContain("`unknown`");
    });

    test("should handle empty search query in context", () => {
      const projects: Project[] = [];
      const context: ProjectListContext = {
        searchQuery: "",
        filterApplied: false,
      };

      const result = formatter.format(projects, context);

      expect(result).toContain("📋 No Projects Found");
      expect(result).not.toContain('Search: ""');
    });

    test("should handle zero total count", () => {
      const projects: Project[] = [];
      const context: ProjectListContext = {
        totalCount: 0,
        hasMore: false,
      };

      const result = formatter.format(projects, context);

      expect(result).toContain("📋 No Projects Found");
    });

    test("should handle large project counts", () => {
      const projects: Project[] = Array.from({ length: 50 }, (_, i) => ({
        id: `1000${i}`,
        key: `PROJ${i}`,
        name: `Project ${i}`,
        projectTypeKey: "software",
        simplified: false,
        style: "classic",
        isPrivate: false,
      }));

      const context: ProjectListContext = {
        totalCount: 500,
        hasMore: true,
      };

      const result = formatter.format(projects, context);

      expect(result).toContain("Found 50 projects (showing 50 of 500)");
      expect(result).toContain("📄 **More projects available**");
    });
  });

  describe("next actions and tips", () => {
    test("should include comprehensive next actions", () => {
      const projects: Project[] = [
        mockFactory.createMockProject({
          key: "ACTIONS",
          name: "Actions Test Project",
        }),
      ];

      const result = formatter.format(projects);

      expect(result).toContain("🚀 Next Actions");
      expect(result).toContain(
        '🔍 **Search projects:** `jira_get_projects searchQuery="project name"`',
      );
      expect(result).toContain(
        '📂 **Filter by type:** `jira_get_projects typeKey="software"`',
      );
      expect(result).toContain(
        '📋 **Get project details:** `jira_get_project projectKey="PROJ"`',
      );
      expect(result).toContain(
        '🎯 **Browse issues:** `jira_search_issues jql="project = PROJ"`',
      );
    });

    test("should include helpful tips", () => {
      const projects: Project[] = [
        mockFactory.createMockProject({
          key: "TIPS",
          name: "Tips Test Project",
        }),
      ];

      const result = formatter.format(projects);

      expect(result).toContain("💡 Tips");
      expect(result).toContain(
        '💡 Use `expand=["description","lead","issueTypes"]` for more details',
      );
      expect(result).toContain(
        '🔄 Use `orderBy="name"` to sort projects alphabetically',
      );
      expect(result).toContain(
        "📊 Use `recent=5` to see your recently accessed projects",
      );
    });
  });

  describe("edge cases", () => {
    test("should handle projects with special characters in names", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "SPECIAL",
          name: "Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain(
        "**SPECIAL** - Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
      );
    });

    test("should handle projects with very long names", () => {
      const longName =
        "This is a very long project name that might cause formatting issues if not handled properly in the display logic";

      const projects: Project[] = [
        {
          id: "10001",
          key: "LONG",
          name: longName,
          projectTypeKey: "software",
          simplified: false,
          style: "classic",
          isPrivate: false,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain(longName);
    });

    test("should handle missing project type", () => {
      const projects: Project[] = [
        {
          id: "10001",
          key: "NOTYPE",
          name: "No Type Project",
          projectTypeKey: "unknown",
          simplified: false,
          style: "classic",
          isPrivate: false,
        },
      ];

      const result = formatter.format(projects);

      expect(result).toContain("1. **NOTYPE** - No Type Project");
      expect(result).toContain("`unknown`");
    });

    test("should handle empty search query in context", () => {
      const projects: Project[] = [];
      const context: ProjectListContext = {
        searchQuery: "",
        filterApplied: false,
      };

      const result = formatter.format(projects, context);

      expect(result).toContain("📋 No Projects Found");
      expect(result).not.toContain('Search: ""');
    });

    test("should handle zero total count", () => {
      const projects: Project[] = [];
      const context: ProjectListContext = {
        totalCount: 0,
        hasMore: false,
      };

      const result = formatter.format(projects, context);

      expect(result).toContain("📋 No Projects Found");
    });

    test("should handle large project counts", () => {
      const projects: Project[] = Array.from({ length: 50 }, (_, i) => ({
        id: `1000${i}`,
        key: `PROJ${i}`,
        name: `Project ${i}`,
        projectTypeKey: "software",
        simplified: false,
        style: "classic",
        isPrivate: false,
      }));

      const context: ProjectListContext = {
        totalCount: 500,
        hasMore: true,
      };

      const result = formatter.format(projects, context);

      expect(result).toContain("Found 50 projects (showing 50 of 500)");
      expect(result).toContain("📄 **More projects available**");
    });
  });
});
