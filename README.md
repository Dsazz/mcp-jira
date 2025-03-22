<div align="center">

# 🔗 JIRA MCP Server for Cursor

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=Jira&logoColor=white)](https://www.atlassian.com/software/jira)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>A powerful Model Context Protocol (MCP) server that brings JIRA integration directly to your Cursor IDE</b>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/website/static/img/mcp-logo.png" alt="MCP Logo" width="200" />
</p>

</div>

---

## ✨ Features

- 📋 **Access JIRA Directly From Cursor**
  - View your assigned issues without leaving your IDE
  - Get detailed information on specific issues with one command
  - Convert JIRA issues into local tasks seamlessly
- ⏰ **System Time Integration**
  - Customizable date and time formatting
  - Locale support via date-fns

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Dsazz/mcp-jira.git
cd mcp-jira

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your JIRA credentials
```

### Configuration

Create a `.env` file with the following variables:

```ini
JIRA_HOST=https://your-instance.atlassian.net
JIRA_USERNAME=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token-here
```

> **🔑 Important Note About JIRA API Tokens**
>
> - Tokens may contain special characters, including the `=` sign
> - Place the token on a single line in the `.env` file
> - Do not add quotes around the token value
> - Paste the token exactly as provided by Atlassian

## 🛠️ Development Tools

### MCP Inspector

<details>
<summary>Click to expand MCP Inspector details</summary>

The MCP Inspector is a powerful tool for testing and debugging your MCP server.

```bash
# Run the inspector (no separate build step needed)
npm run inspect
```

The inspector automatically:

- Loads environment variables from `.env`
- Cleans up occupied ports (5175, 3002)
- Builds the project when needed
- Starts the MCP server with your configuration
- Launches the inspector UI

Visit the inspector at http://localhost:5175?proxyPort=3002

If you encounter port conflicts:

```bash
npm run cleanup-ports
```

#### Debugging with the Inspector

The inspector UI allows you to:

- View all available MCP capabilities
- Execute tools and examine responses
- Analyze the JSON communication
- Test with different parameters

For more details, see the [MCP Inspector GitHub repository](https://github.com/modelcontextprotocol/inspector).

</details>

### Integration with Claude Desktop

<details>
<summary>Click to expand Claude Desktop integration</summary>

Test your MCP server directly with Claude:

1. Build and run your server:

   ```bash
   npm run build
   node dist/index.js
   ```

2. Configure Claude Desktop:

   ```bash
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. Add the MCP configuration:

   ```json
   {
     "mcpServers": {
       "JIRA Tools": {
         "command": "node",
         "args": ["/absolute/path/to/your/project/dist/index.js"],
         "env": {
           "JIRA_USERNAME": "your-jira-username",
           "JIRA_API_TOKEN": "your-jira-api-token",
           "JIRA_HOST": "your-jira-host.atlassian.net"
         }
       }
     }
   }
   ```

4. Restart Claude Desktop and test with:
   ```
   What time is it right now?
   ```
   or
   ```
   Show me my assigned JIRA issues.
   ```

</details>

## 🔌 Integration with Cursor IDE

Add this MCP server to your Cursor IDE's MCP configuration:

```json
{
  "mcpServers": {
    "JIRA Tools": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/dist/index.js"],
      "env": {
        "JIRA_USERNAME": "your-jira-username",
        "JIRA_API_TOKEN": "your-jira-api-token",
        "JIRA_HOST": "your-jira-host.atlassian.net"
      }
    }
  }
}
```

## 🧰 Available Tools

### JIRA Tools

| Tool                       | Description                                      | Parameters                           | Returns                           |
| -------------------------- | ------------------------------------------------ | ------------------------------------ | --------------------------------- |
| `jira_get_assigned_issues` | Retrieves all issues assigned to you             | None                                 | Markdown-formatted list of issues |
| `jira_get_issue`           | Gets detailed information about a specific issue | `issueKey`: Issue key (e.g., PD-312) | Markdown-formatted issue details  |
| `jira_create_task`         | Creates a local task from a JIRA issue           | `issueKey`: Issue key (e.g., PD-312) | Markdown-formatted task           |

### System Time Tools

| Tool              | Description                  | Parameters                                  | Returns                    |
| ----------------- | ---------------------------- | ------------------------------------------- | -------------------------- |
| `get_system_time` | Gets the current system time | `format`: (Optional) date-fns format string | Formatted date/time string |

## 📁 Project Structure

```
src/
 ├── features/        # MCP features (JIRA, system time)
 ├── server/          # MCP server implementation
 ├── shared/          # Shared utilities
 └── index.ts         # Main entry point
```

### NPM Scripts

| Command                 | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm run build`         | Build the project                         |
| `npm run publish`       | Build and publish package to npm registry |
| `npm run inspect`       | Run with MCP inspector for debugging      |
| `npm run cleanup-ports` | Release ports used by the inspector       |
| `npm test`              | Run tests                                 |

## 📘 Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/specification/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

## 📄 License

[MIT](LICENSE) © Stanislav Stepanenko

---

<div align="center">
  <sub>Built with ❤️ for a better developer experience</sub>
</div>
