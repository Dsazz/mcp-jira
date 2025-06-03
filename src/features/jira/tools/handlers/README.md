# Handler Layer

## Purpose

The Handler layer provides the entry points for JIRA operations through the MCP (Multimodal Copilot) framework. Handlers implement the BaseToolHandler class and serve as the bridge between user commands and the underlying JIRA integration.

## Architecture

Handlers implement the following pattern:

1. **Tool Definition**: Each handler defines an MCP tool with name and description
2. **Parameter Schema**: Defines the expected input parameters for the tool
3. **Dependency Injection**: Dependencies (use cases, validators) are injected via constructor
4. **Execute Method**: Core execution logic that processes input and returns results
5. **Error Enhancement**: Transforms technical errors into user-friendly messages

## Components

| Handler                    | Purpose                      | Dependencies                                       |
| -------------------------- | ---------------------------- | -------------------------------------------------- |
| `CreateIssueHandler`       | Creates new JIRA issues      | `CreateIssueUseCase`                               |
| `UpdateIssueHandler`       | Updates existing issues      | `UpdateIssueUseCase`                               |
| `SearchIssuesHandler`      | Searches for issues with JQL | `SearchIssuesUseCase`                              |
| `GetBoardsHandler`         | Retrieves JIRA boards        | `GetBoardsUseCase`, `BoardValidator`               |
| `GetSprintsHandler`        | Retrieves board sprints      | `GetSprintsUseCase`, `SprintValidator`             |
| `GetIssueCommentsHandler`  | Gets issue comments          | `GetIssueCommentsUseCase`, `IssueCommentValidator` |
| `GetProjectsHandler`       | Gets JIRA projects           | `GetProjectsUseCase`, `ProjectParamsValidator`     |
| `GetAssignedIssuesHandler` | Gets user's assigned issues  | `GetAssignedIssuesUseCase`                         |
| `GetIssueHandler`          | Gets single issue details    | `GetIssueUseCase`, `IssueParamsValidator`          |

## Usage Example

```typescript
// Example handler implementation
export class GetProjectsHandler extends BaseToolHandler<
  GetProjectsParams,
  string
> {
  constructor(
    private readonly getProjectsUseCase: GetProjectsUseCase,
    private readonly projectParamsValidator: ProjectParamsValidator
  ) {
    super("JIRA", "Get Projects");
    this.formatter = new ProjectListFormatter();
  }

  protected async execute(params: GetProjectsParams): Promise<string> {
    try {
      // 1. Validate parameters
      const validatedParams =
        this.projectParamsValidator.validateGetProjectsParams(params);

      // 2. Execute use case
      const projects = await this.getProjectsUseCase.execute(validatedParams);

      // 3. Format and return results
      return this.formatter.format(projects);
    } catch (error) {
      // 4. Handle and enhance errors
      throw this.enhanceError(error, params);
    }
  }
}
```

## Design Decisions

1. **Single Responsibility**: Each handler has a single, clear responsibility
2. **User-Friendly Errors**: Technical errors are transformed into user-friendly messages
3. **Separation of Concerns**: Handlers delegate to use cases and validators
4. **Consistent Interface**: All handlers follow the same interface pattern
5. **Progressive Enhancement**: Error messages include progressively more detailed help
