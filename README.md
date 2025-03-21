# Cursor JIRA MCP Tools

A Model Context Protocol (MCP) server that provides JIRA integration tools for Cursor IDE.

## Features

- **Jira Tools**:
  - Get assigned issues
  - Get specific issue details
  - Create tasks from Jira issues

## Quick Start

You can run this tool directly using npx:

```bash
npx @cursor-tools/mcp-jira
```

## Installation

If you prefer to install globally:

```bash
npm install -g @cursor-tools/mcp-jira
```

Then you can run it using:

```bash
cursor-jira
```

## Configuration

The tool requires the following environment variables to be set in your Cursor IDE's MCP configuration:

```json
{
  "mcpServers": {
    "JIRA Tools": {
      "command": "npx",
      "args": ["@cursor-tools/mcp-jira"],
      "env": {
        "JIRA_USERNAME": "your-jira-username",
        "JIRA_API_TOKEN": "your-jira-api-token",
        "JIRA_HOST": "your-jira-host.atlassian.net"
      }
    }
  }
}
```

## MCP Tools

### Jira Tools

#### Get Assigned Issues

- **Tool Name**: `mcp__jira_get_assigned_issues`
- **Parameters**: No params
- **Returns**: Markdown-formatted list of assigned Jira issues

#### Get Issue

- **Tool Name**: `mcp__jira_get_issue`
- **Parameters**:
  - `issueKey`: The Jira issue key (e.g., PD-312)
- **Returns**: Markdown-formatted details of the specified issue

#### Create Task from Issue

- **Tool Name**: `mcp__jira_create_task`
- **Parameters**:
  - `issueKey`: The Jira issue key (e.g., PD-312)
- **Returns**: Markdown-formatted task created from the issue

## Development

### Building

```bash
npm install
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/specification/)
