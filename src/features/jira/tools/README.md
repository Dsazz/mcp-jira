# JIRA Tools Module

This module provides tools for interacting with JIRA from within the MCP framework.

## Directory Structure

The JIRA tools module is organized into the following directories:

```
/src/features/jira/tools/
├── README.md              # This documentation
├── index.ts               # Main entry point that exports all components
├── handlers/              # Tool handlers for JIRA operations
│   ├── get-issue.handler.ts             # Handler for retrieving a specific JIRA issue
│   ├── get-assigned-issues.handler.ts   # Handler for retrieving assigned JIRA issues
│   └── create-task.handler.ts           # Handler for creating a local task from a JIRA issue
└── utils/                 # Utility functions and types
    ├── config.ts          # Configuration utilities for JIRA
    ├── errors.ts          # Error handling utilities for JIRA
    └── schemas.ts         # Zod schemas and types for JIRA data
```

### Getting Assigned Issues

```typescript
import { JiraClient } from "../api/client";
import { GetAssignedIssuesHandler } from "./handlers/get-assigned-issues.handler";

const client = new JiraClient({
  baseUrl: "https://your-jira-instance.atlassian.net",
  username: "your-username",
  apiToken: "your-api-token",
});

const getAssignedIssuesHandler = new GetAssignedIssuesHandler(client);

getAssignedIssuesHandler
  .handle({})
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

### Creating a Local Task from a JIRA Issue

```typescript
import { JiraClient } from "../api/client";
import { CreateTaskHandler } from "./handlers/create-task.handler";

const client = new JiraClient({
  baseUrl: "https://your-jira-instance.atlassian.net",
  username: "your-username",
  apiToken: "your-api-token",
});

const createTaskHandler = new CreateTaskHandler(client);

const issueKey = "PROJ-123";
createTaskHandler
  .handle({ issueKey })
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

## Using the Factory Function

```typescript
import { JiraClient } from "../api/client";
import { createJiraTools } from "./index";

const client = new JiraClient({
  baseUrl: "https://your-jira-instance.atlassian.net",
  username: "your-username",
  apiToken: "your-api-token",
});

const jiraTools = createJiraTools(client);

// Now you can use all tools with the same client
jiraTools.getIssue
  .handle({ issueKey: "PROJ-123" })
  .then((result) => console.log(result));

jiraTools.getAssignedIssues.handle({}).then((result) => console.log(result));

jiraTools.createTask
  .handle({ issueKey: "PROJ-123" })
  .then((result) => console.log(result));
```
