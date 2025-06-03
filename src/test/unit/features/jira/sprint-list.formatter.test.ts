/**
 * Sprint List Formatter Tests
 * Tests for the sprint list formatting functionality
 */

import { describe, expect, it } from "bun:test";
import { SprintListFormatter } from "@features/jira/formatters/sprint-list.formatter";
import type { Sprint } from "@features/jira/repositories/sprint.types";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("SprintListFormatter", () => {
  // Create a formatter instance to use in all tests
  const formatter = new SprintListFormatter();

  describe("format method", () => {
    it("should format complete sprint list correctly", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Sprint 1 - Active Development",
          startDate: "2024-01-15T09:00:00.000Z",
          endDate: "2024-01-29T17:00:00.000Z",
          createdDate: "2024-01-14T10:00:00.000Z",
          originBoardId: 1,
          goal: "Implement user authentication and authorization features",
        },
        {
          id: 2,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/2",
          state: "closed",
          name: "Sprint 2 - Bug Fixes",
          startDate: "2024-01-01T09:00:00.000Z",
          endDate: "2024-01-14T17:00:00.000Z",
          completeDate: "2024-01-14T16:30:00.000Z",
          createdDate: "2023-12-31T10:00:00.000Z",
          originBoardId: 1,
          goal: "Fix critical bugs and improve performance",
        },
        {
          id: 3,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/3",
          state: "future",
          name: "Sprint 3 - New Features",
          startDate: "2024-02-01T09:00:00.000Z",
          endDate: "2024-02-15T17:00:00.000Z",
          createdDate: "2024-01-20T10:00:00.000Z",
          originBoardId: 1,
          goal: "Develop new dashboard features",
        },
      ];

      const boardId = 1;
      const appliedFilters = {
        state: "active",
        boardId: 1,
      };

      const result = formatter.format({ sprints, boardId, appliedFilters });

      expect(result).toContain("🏃 Sprints for Board 1");
      expect(result).toContain("Found **3** sprints");
      expect(result).toContain("🔄 1 active, ✅ 1 closed, ⏳ 1 future");
      expect(result).toContain("filtered by state: **active**");
      expect(result).toContain("🔄 ACTIVE SPRINTS (1)");
      expect(result).toContain("1. Sprint 1 - Active Development");
      expect(result).toContain("**Sprint ID:** 1");
      expect(result).toContain("**State:** 🔄 ACTIVE");
      expect(result).toContain("**Start:** Jan 15, 2024");
      expect(result).toContain("**End:** Jan 29, 2024");
      expect(result).toContain(
        "**Goal:** Implement user authentication and authorization features",
      );
      expect(result).toContain("**Origin Board:** 1");
      expect(result).toContain("⏳ FUTURE SPRINTS (1)");
      expect(result).toContain("✅ CLOSED SPRINTS (1)");
      expect(result).toContain("[View Sprint]");
      expect(result).toContain("[Sprint Report]");
      expect(result).toContain("[View Board]");
      expect(result).toContain("🚀 Next Actions");
    });

    it("should handle empty sprint list", () => {
      const sprints: Sprint[] = [];
      const boardId = 1;
      const appliedFilters = {
        state: "active",
        boardId: 1,
      };

      const result = formatter.format({ sprints, boardId, appliedFilters });

      expect(result).toContain("🏃 Sprints for Board 1");
      expect(result).toContain("No sprints found matching your criteria");
      expect(result).toContain("**Applied filters:** state: active");
      expect(result).toContain("💡 Suggestions");
      expect(result).toContain("Try removing the state filter");
      expect(result).toContain("Check if the board has any sprints created");
      expect(result).toContain("Contact your JIRA administrator");
    });

    it("should format minimal sprint data", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Minimal Sprint",
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("🏃 JIRA Sprints");
      expect(result).toContain("Found **1** sprint");
      expect(result).toContain("🔄 1 active");
      expect(result).toContain("🔄 ACTIVE SPRINTS (1)");
      expect(result).toContain("1. Minimal Sprint");
      expect(result).toContain("**Sprint ID:** 1");
      expect(result).toContain("**State:** 🔄 ACTIVE");
      expect(result).toContain("[View Sprint]");
      expect(result).toContain("🚀 Next Actions");
    });

    it("should handle missing optional fields", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Partial Sprint",
          startDate: undefined,
          endDate: undefined,
          completeDate: undefined,
          createdDate: undefined,
          originBoardId: undefined,
          goal: undefined,
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("1. Partial Sprint");
      expect(result).toContain("**State:** 🔄 ACTIVE");
      expect(result).not.toContain("**Start:**");
      expect(result).not.toContain("**End:**");
      expect(result).not.toContain("**Goal:**");
      expect(result).not.toContain("**Origin Board:**");
    });

    it("should handle all sprint states", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Active Sprint",
          state: "active",
        }),
        mockFactory.createMockSprint({
          id: 2,
          name: "Closed Sprint",
          state: "closed",
        }),
        mockFactory.createMockSprint({
          id: 3,
          name: "Future Sprint",
          state: "future",
        }),
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("🔄 1 active, ✅ 1 closed, ⏳ 1 future");
      expect(result).toContain("🔄 ACTIVE SPRINTS (1)");
      expect(result).toContain("⏳ FUTURE SPRINTS (1)");
      expect(result).toContain("✅ CLOSED SPRINTS (1)");
    });

    it("should group sprints by state correctly", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Active Sprint 1",
          state: "active",
        }),
        mockFactory.createMockSprint({
          id: 2,
          name: "Active Sprint 2",
          state: "active",
        }),
        mockFactory.createMockSprint({
          id: 3,
          name: "Closed Sprint 1",
          state: "closed",
        }),
        mockFactory.createMockSprint({
          id: 4,
          name: "Future Sprint 1",
          state: "future",
        }),
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("🔄 2 active, ✅ 1 closed, ⏳ 1 future");
      expect(result).toContain("🔄 ACTIVE SPRINTS (2)");
      expect(result).toContain("1. Active Sprint 1");
      expect(result).toContain("2. Active Sprint 2");
      expect(result).toContain("⏳ FUTURE SPRINTS (1)");
      expect(result).toContain("1. Future Sprint 1");
      expect(result).toContain("✅ CLOSED SPRINTS (1)");
      expect(result).toContain("1. Closed Sprint 1");
    });

    it("should handle sprint with goal", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Goal Sprint",
          goal: "Implement comprehensive user authentication system with OAuth2 integration",
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain(
        "**Goal:** Implement comprehensive user authentication system with OAuth2 integration",
      );
    });

    it("should handle sprint with dates", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Date Sprint",
          startDate: "2024-01-15T09:00:00.000Z",
          endDate: "2024-01-29T17:00:00.000Z",
          createdDate: "2024-01-14T10:00:00.000Z",
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("**Start:** Jan 15, 2024");
      expect(result).toContain("**End:** Jan 29, 2024");
      expect(result).toContain("**Created:** Jan 14, 2024");
    });

    it("should handle closed sprint with complete date", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "closed",
          name: "Completed Sprint",
          startDate: "2024-01-01T09:00:00.000Z",
          endDate: "2024-01-14T17:00:00.000Z",
          completeDate: "2024-01-14T16:30:00.000Z",
          createdDate: "2023-12-31T10:00:00.000Z",
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("**Completed:** Jan 14, 2024");
    });

    it("should handle sprint with origin board", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Board Sprint",
          originBoardId: 5,
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("**Origin Board:** 5");
    });

    it("should include board actions when origin board is present", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Board Actions Sprint",
          originBoardId: 5,
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("[View Board]");
    });

    it("should not include board actions when origin board is missing", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "No Board Sprint",
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).not.toContain("[View Board]");
    });

    it("should handle active sprint with progress calculation", () => {
      // Create an active sprint that started 7 days ago and ends in 7 days (50% progress)
      const now = new Date();
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Progress Sprint",
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("**Progress:**");
      expect(result).toContain("days remaining");
    });
  });

  describe("filter handling", () => {
    it("should handle state filter", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({
          name: "Active Sprint",
          state: "active",
        }),
      ];

      const appliedFilters = {
        state: "active",
      };

      const result = formatter.format({ sprints, appliedFilters });

      expect(result).toContain("filtered by state: **active**");
    });

    it("should handle board ID context", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({ name: "Board Sprint" }),
      ];

      const boardId = 5;

      const result = formatter.format({ sprints, boardId });

      expect(result).toContain("🏃 Sprints for Board 5");
    });

    it("should handle no board ID", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({ name: "General Sprint" }),
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("🏃 JIRA Sprints");
    });

    it("should handle no filters", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({ name: "No Filter Sprint" }),
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("Found **1** sprint");
      expect(result).not.toContain("filtered by state:");
    });

    it("should handle empty filters object", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({ name: "Empty Filter Sprint" }),
      ];

      const appliedFilters = {};
      const result = formatter.format({ sprints, appliedFilters });

      expect(result).toContain("Found **1** sprint");
      expect(result).not.toContain("filtered by state:");
    });
  });

  describe("next actions", () => {
    it("should include comprehensive next actions", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({ name: "Actions Sprint" }),
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("🚀 Next Actions");
      expect(result).toContain(
        "Use `jira_search_issues` to find issues in specific sprints",
      );
      expect(result).toContain("Use `jira_get_boards` to explore");
      expect(result).toContain('Filter sprints by state: `state: "active"`');
    });

    it("should include board-specific next actions when board ID is provided", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({ name: "Board Actions Sprint" }),
      ];

      const boardId = 5;

      const result = formatter.format({ sprints, boardId });

      expect(result).toContain("Use `jira_get_boards` to view board 5 details");
      expect(result).toContain("Use `jira_get_boards` to explore other boards");
    });
  });

  describe("edge cases", () => {
    it("should handle sprints with special characters in names", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?");
    });

    it("should handle sprints with very long names", () => {
      const longName =
        "This is a very long sprint name that might cause formatting issues if not handled properly in the display logic";

      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: longName,
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain(longName);
    });

    it("should handle sprints with very long goals", () => {
      const longGoal =
        "This is a very long sprint goal that contains multiple sentences and detailed descriptions of what needs to be accomplished during this sprint iteration including various user stories, bug fixes, technical debt reduction, performance improvements, and documentation updates.";

      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Long Goal Sprint",
          goal: longGoal,
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain(longGoal);
    });

    it("should handle large sprint counts", () => {
      const sprints: Sprint[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        self: `https://company.atlassian.net/rest/agile/1.0/sprint/${i + 1}`,
        state: i % 3 === 0 ? "active" : i % 3 === 1 ? "closed" : "future",
        name: `Sprint ${i + 1}`,
      })) as Sprint[];

      const result = formatter.format({ sprints });

      expect(result).toContain("Found **20** sprints");
      expect(result).toContain("1. Sprint 1");
      expect(result).toContain("Sprint 20");
    });

    it("should handle sprints with missing self URLs", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "",
          state: "active",
          name: "No Self URL Sprint",
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("1. No Self URL Sprint");
      expect(result).toContain("[View Sprint]()");
    });

    it("should handle invalid dates gracefully", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "Invalid Date Sprint",
          startDate: "invalid-date",
          endDate: "also-invalid",
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("1. Invalid Date Sprint");
      // Should handle invalid dates gracefully without crashing
    });

    it("should handle empty sprint name", () => {
      const sprints: Sprint[] = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          state: "active",
          name: "",
        },
      ];

      const result = formatter.format({ sprints });

      expect(result).toContain("**Sprint ID:** 1");
      // Should handle empty name gracefully
    });

    it("should handle zero board ID", () => {
      const sprints: Sprint[] = [
        mockFactory.createMockSprint({ name: "Zero Board Sprint" }),
      ];

      const boardId = 0;

      const result = formatter.format({ sprints, boardId });

      expect(result).toContain("🏃 JIRA Sprints");
    });
  });
});
