/**
 * Board List Formatter Unit Tests
 * Comprehensive unit tests for JIRA board list formatter
 */

import { describe, expect, test } from "bun:test";
import { BoardListFormatter } from "@features/jira/boards/formatters/board-list.formatter";
import type { Board } from "@features/jira/boards/models/board.models";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("BoardListFormatter", () => {
  // Create a formatter instance to use in all tests
  const formatter = new BoardListFormatter();

  describe("format method", () => {
    test("should format complete board list correctly", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Test Scrum Board",
          type: "scrum",
          location: {
            projectId: 10001,
            projectKey: "TEST",
            projectName: "Test Project",
            projectTypeKey: "software",
            displayName: "Test Project (TEST)",
          },
          canEdit: true,
          isPrivate: false,
          favourite: true,
          admins: {
            users: [
              {
                accountId: "admin-123",
                displayName: "John Admin",
              },
            ],
            groups: [
              {
                name: "jira-administrators",
                groupId: "jira-administrators",
              },
            ],
          },
        },
        {
          id: "2",
          self: "https://company.atlassian.net/rest/agile/1.0/board/2",
          name: "Kanban Board",
          type: "kanban",
          location: {
            projectId: 10002,
            projectKey: "DEMO",
            projectName: "Demo Project",
            projectTypeKey: "business",
            displayName: "Demo Project (DEMO)",
          },
          canEdit: false,
          isPrivate: true,
          favourite: false,
        },
      ];

      const appliedFilters = {
        type: "scrum",
        projectKeyOrId: "TEST",
        name: "test",
      };

      const result = formatter.format({ boards, appliedFilters });

      expect(result).toContain("📋 JIRA Boards");
      expect(result).toContain("Found **2** boards");
      expect(result).toContain(
        '(filtered by type: scrum, project: TEST, name: "test")',
      );
      expect(result).toContain("1. Test Scrum Board ⭐");
      expect(result).toContain("🏃 **Scrum Board**");
      expect(result).toContain("**Board ID:** 1");
      expect(result).toContain("**Project:** Test Project");
      expect(result).toContain("**Key:** TEST");
      expect(result).toContain("**Can Edit:** Yes");
      expect(result).toContain("**Private:** No");
      expect(result).toContain("**Admin Users:** John Admin");
      expect(result).toContain("**Admin Groups:** jira-administrators");
      expect(result).toContain("2. Kanban Board 🔒");
      expect(result).toContain("📊 **Kanban Board**");
      expect(result).toContain("**Board ID:** 2");
      expect(result).toContain("**Can Edit:** No");
      expect(result).toContain("**Private:** Yes");
      expect(result).toContain("[View Board]");
      expect(result).toContain("[Browse Issues]");
      expect(result).toContain("[Board Settings]");
      expect(result).toContain("🚀 Next Actions");
    });

    test("should handle empty board list", () => {
      const boards: Board[] = [];
      const appliedFilters = {
        type: "scrum",
        projectKeyOrId: "NONEXISTENT",
      };

      const result = formatter.format({ boards, appliedFilters });

      expect(result).toContain("📋 JIRA Boards");
      expect(result).toContain("No boards found matching your criteria");
      expect(result).toContain(
        "**Applied filters:** type: scrum, project: NONEXISTENT",
      );
      expect(result).toContain("💡 Suggestions");
      expect(result).toContain("Try removing some filters to see more results");
      expect(result).toContain(
        "Check if you have access to boards in the specified project",
      );
      expect(result).toContain(
        "Contact your JIRA administrator if you expect to see boards",
      );
    });

    test("should format minimal board data", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Minimal Board",
          type: "simple",
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("📋 JIRA Boards");
      expect(result).toContain("Found **1** board");
      expect(result).toContain("1. Minimal Board");
      expect(result).toContain("📝 **Simple Board**");
      expect(result).toContain("**Board ID:** 1");
      expect(result).toContain("[View Board]");
      expect(result).toContain("🚀 Next Actions");
    });

    test("should handle missing optional fields", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Partial Board",
          type: "scrum",
          location: undefined,
          canEdit: undefined,
          isPrivate: undefined,
          favourite: undefined,
          admins: undefined,
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("1. Partial Board");
      expect(result).toContain("🏃 **Scrum Board**");
      expect(result).not.toContain("**Project:**");
      expect(result).not.toContain("**Key:**");
      expect(result).not.toContain("**Can Edit:**");
      expect(result).not.toContain("**Private:**");
      expect(result).not.toContain("**Admin Users:**");
      expect(result).not.toContain("**Admin Groups:**");
    });

    test("should handle board with no location", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "No Location Board",
          type: "kanban",
          canEdit: true,
          isPrivate: false,
          favourite: false,
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("1. No Location Board");
      expect(result).toContain("📊 **Kanban Board**");
      expect(result).toContain("**Can Edit:** Yes");
      expect(result).toContain("**Private:** No");
      expect(result).not.toContain("**Project:**");
      expect(result).not.toContain("[Browse Issues]");
    });

    test("should handle board with partial location", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Partial Location Board",
          type: "scrum",
          location: {
            projectName: "Test Project",
            // Missing projectKey
          },
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("**Project:** Test Project");
      expect(result).not.toContain("**Key:**");
    });

    test("should handle board with empty admins", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Empty Admins Board",
          type: "scrum",
          admins: {
            users: [],
            groups: [],
          },
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("1. Empty Admins Board");
      expect(result).not.toContain("**Admin Users:**");
      expect(result).not.toContain("**Admin Groups:**");
    });

    test("should handle board with only user admins", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "User Admins Board",
          type: "scrum",
          admins: {
            users: [
              { accountId: "user1", displayName: "User One" },
              { accountId: "user2", displayName: "User Two" },
            ],
          },
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("**Admin Users:** User One, User Two");
      expect(result).not.toContain("**Admin Groups:**");
    });

    test("should handle board with only group admins", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Group Admins Board",
          type: "scrum",
          admins: {
            groups: [
              { name: "jira-administrators", groupId: "jira-administrators" },
              { name: "project-admins", groupId: "project-admins" },
            ],
          },
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain(
        "**Admin Groups:** jira-administrators, project-admins",
      );
      expect(result).not.toContain("**Admin Users:**");
    });

    test("should handle all board types", () => {
      const boards: Board[] = [
        mockFactory.createMockBoard({
          id: "1",
          name: "Scrum Board",
          type: "scrum",
        }),
        mockFactory.createMockBoard({
          id: "2",
          name: "Kanban Board",
          type: "kanban",
        }),
        mockFactory.createMockBoard({
          id: "3",
          name: "Simple Board",
          type: "simple",
        }),
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("🏃 **Scrum Board**");
      expect(result).toContain("📊 **Kanban Board**");
      expect(result).toContain("📝 **Simple Board**");
    });

    test("should handle unknown board type", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Unknown Type Board",
          type: "custom" as "scrum",
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("📋 **custom Board**");
    });

    test("should include sprint actions for scrum boards", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Scrum Board",
          type: "scrum",
          location: {
            projectKey: "TEST",
          },
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("[View Sprints]");
    });

    test("should not include sprint actions for non-scrum boards", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Kanban Board",
          type: "kanban",
          location: {
            projectKey: "TEST",
          },
        },
      ];

      const result = formatter.format({ boards });

      expect(result).not.toContain("[View Sprints]");
    });

    test("should handle favorite and private indicators", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Favorite Board",
          type: "scrum",
          favourite: true,
          isPrivate: false,
        },
        {
          id: "2",
          self: "https://company.atlassian.net/rest/agile/1.0/board/2",
          name: "Private Board",
          type: "kanban",
          favourite: false,
          isPrivate: true,
        },
        {
          id: "3",
          self: "https://company.atlassian.net/rest/agile/1.0/board/3",
          name: "Favorite Private Board",
          type: "simple",
          favourite: true,
          isPrivate: true,
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("1. Favorite Board ⭐");
      expect(result).toContain("2. Private Board 🔒");
      expect(result).toContain("3. Favorite Private Board ⭐ 🔒");
    });

    test("should handle board with empty filters", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Test Board",
          type: "scrum",
        },
      ];

      const appliedFilters = {};
      const result = formatter.format({ boards, appliedFilters });

      expect(result).toContain("Found **1** board");
    });
  });

  describe("filter handling", () => {
    test("should handle type filter", () => {
      const boards: Board[] = [
        mockFactory.createMockBoard({ name: "Scrum Board", type: "scrum" }),
      ];

      const appliedFilters = {
        type: "scrum",
      };

      const result = formatter.format({ boards, appliedFilters });

      expect(result).toContain("(filtered by type: scrum)");
    });

    test("should handle project filter", () => {
      const boards: Board[] = [
        mockFactory.createMockBoard({ name: "Project Board" }),
      ];

      const appliedFilters = {
        projectKeyOrId: "TEST",
      };

      const result = formatter.format({ boards, appliedFilters });

      expect(result).toContain("(filtered by project: TEST)");
    });

    test("should handle name filter", () => {
      const boards: Board[] = [
        mockFactory.createMockBoard({ name: "Search Board" }),
      ];

      const appliedFilters = {
        name: "search",
      };

      const result = formatter.format({ boards, appliedFilters });

      expect(result).toContain('(filtered by name: "search")');
    });

    test("should handle multiple filters", () => {
      const boards: Board[] = [
        mockFactory.createMockBoard({
          name: "Multi Filter Board",
          type: "scrum",
        }),
      ];

      const appliedFilters = {
        type: "scrum",
        projectKeyOrId: "TEST",
        name: "multi",
      };

      const result = formatter.format({ boards, appliedFilters });

      expect(result).toContain(
        '(filtered by type: scrum, project: TEST, name: "multi")',
      );
    });

    test("should handle no filters", () => {
      const boards: Board[] = [
        mockFactory.createMockBoard({ name: "No Filter Board" }),
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("Found **1** board");
      expect(result).not.toContain("(filtered by");
    });

    test("should handle empty filters object", () => {
      const boards: Board[] = [
        mockFactory.createMockBoard({ name: "Empty Filter Board" }),
      ];

      const appliedFilters = {};
      const result = formatter.format({ boards, appliedFilters });

      expect(result).toContain("Found **1** board");
      expect(result).not.toContain("(filtered by");
    });
  });

  describe("next actions", () => {
    test("should include comprehensive next actions", () => {
      const boards: Board[] = [
        mockFactory.createMockBoard({ name: "Actions Board" }),
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("🚀 Next Actions");
      expect(result).toContain(
        "Use `jira_get_sprints` to view sprints for a specific board",
      );
      expect(result).toContain(
        "Use `jira_search_issues` to find issues on specific boards",
      );
      expect(result).toContain(
        "Use `jira_get_projects` to explore project details",
      );
      expect(result).toContain(
        'Filter boards by type: `type: "scrum"` or `type: "kanban"`',
      );
      expect(result).toContain('Search boards by name: `name: "My Board"`');
      expect(result).toContain('Filter by project: `projectKeyOrId: "PROJ"`');
    });
  });

  describe("edge cases", () => {
    test("should handle boards with special characters in names", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: "Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
          type: "scrum",
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?");
    });

    test("should handle boards with very long names", () => {
      const longName =
        "This is a very long board name that might cause formatting issues if not handled properly in the display logic";

      const boards: Board[] = [
        {
          id: "1",
          self: "https://company.atlassian.net/rest/agile/1.0/board/1",
          name: longName,
          type: "scrum",
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain(longName);
    });

    test("should handle large board counts", () => {
      const boards: Board[] = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        self: `https://company.atlassian.net/rest/agile/1.0/board/${i + 1}`,
        name: `Board ${i + 1}`,
        type: "scrum" as const,
      }));

      const result = formatter.format({ boards });

      expect(result).toContain("Found **25** boards");
      expect(result).toContain("1. Board 1");
      expect(result).toContain("25. Board 25");
    });

    test("should handle boards with missing self URLs", () => {
      const boards: Board[] = [
        {
          id: "1",
          self: "",
          name: "No Self URL Board",
          type: "scrum",
        },
      ];

      const result = formatter.format({ boards });

      expect(result).toContain("1. No Self URL Board");
      expect(result).toContain("[View Board]()");
    });
  });
});
