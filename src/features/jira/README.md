# JIRA Integration Feature

This module provides a seamless integration between the MCP (Model Context Protocol) and JIRA, allowing users to interact with JIRA issues directly through MCP tools.

## Features

- Retrieve detailed information about specific JIRA issues
- List all issues assigned to the current user
- Create local tasks from JIRA issues

## Architecture

The JIRA integration follows a modular, component-based architecture with clear separation of concerns:

### Design Principles

1. **Separation of Concerns**: Each component has a single responsibility

   - Tools orchestrate operations
   - Formatters handle presentation
   - Validators ensure input correctness
   - Error handlers provide consistent error responses

2. **Co-location of Related Code**: Files related to a feature are grouped together

   - Each tool has its own directory with schema and types
   - Interfaces are placed alongside implementations

3. **Composition over Inheritance**: Direct formatter composition in tools

   - Tools directly instantiate formatter instances
   - Clear dependencies without factory complexity

4. **Type Safety**: Comprehensive TypeScript types throughout the codebase
   - Zod schemas for runtime validation
   - TypeScript interfaces for compile-time checking

## Tool Implementations

### Base Tool

The `BaseTool` abstract class provides common functionality for all JIRA tools:

- Environment validation
- Error handling
- Logging
- Response formatting

### GetIssueTool

Retrieves and formats detailed information about a specific JIRA issue.

**Parameters:**

- `issueKey`: The JIRA issue key (e.g., "PD-123")

**Usage:**

```typescript
const tool = new GetIssueTool();
const response = await tool.handler({ issueKey: "PD-123" });
```

### GetAssignedIssuesTool

Retrieves and formats all JIRA issues assigned to the current user.

**Parameters:** None required

**Usage:**

```typescript
const tool = new GetAssignedIssuesTool();
const response = await tool.handler({});
```

### CreateTaskTool

Creates a local task from a JIRA issue.

**Parameters:**

- `issueKey`: The JIRA issue key (e.g., "PD-123")

**Usage:**

```typescript
const tool = new CreateTaskTool();
const response = await tool.handler({ issueKey: "PD-123" });
```

## Formatters

Formatters convert JIRA API responses into human-readable markdown:

- `IssueFormatter`: Formats a single JIRA issue
- `IssueListFormatter`: Formats a list of JIRA issues

## Configuration

Configuration is managed through environment variables:

- `JIRA_USERNAME`: Your JIRA username
- `JIRA_API_TOKEN`: Your JIRA API token
- `JIRA_HOST`: Your JIRA instance URL (e.g., "https://your-domain.atlassian.net")

## Error Handling

Errors are handled consistently through the `handleError` function, which:

- Logs errors appropriately
- Converts errors to user-friendly responses
- Maintains context about the error

### Registering the JIRA Feature

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { initializeJiraFeature } from "./features/jira";

const server = new McpServer();
initializeJiraFeature(server);
```

## Extending the Module

### Adding a New Tool

1. Create a new directory in `tools/` for your tool
2. Create schema and types files if needed
3. Implement the tool class extending BaseTool
4. Update `register-tools.ts` to register your new tool

## Testing

Each component is designed to be testable in isolation:

- Tools can be tested with mocked API clients and formatters
- Formatters can be tested with sample data
- Validators can be tested with valid and invalid inputs
