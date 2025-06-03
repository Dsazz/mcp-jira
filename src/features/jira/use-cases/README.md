# Use Cases Layer

## Purpose

The Use Cases layer encapsulates business logic extracted from the JIRA client. Each use case follows the single responsibility principle and focuses on a specific business operation.

## Architecture

Use cases implement the following pattern:

1. **Interface Definition**: Each use case has a clear interface that defines its contract
2. **Request Type**: A dedicated request type for input parameters with proper typing
3. **Implementation Class**: A concrete implementation that handles the business logic
4. **Repository Dependency**: Uses repositories to interact with external services
5. **Error Handling**: Proper error handling and transformation for consistent API

## Components

| Use Case                   | Purpose                                     | Repository Dependencies               |
| -------------------------- | ------------------------------------------- | ------------------------------------- |
| `CreateIssueUseCase`       | Handles JIRA issue creation with validation | `IssueRepository`, `ProjectValidator` |
| `UpdateIssueUseCase`       | Manages issue updates with transitions      | `IssueRepository`                     |
| `SearchIssuesUseCase`      | Builds and executes JQL queries             | `IssueSearchRepository`               |
| `GetBoardsUseCase`         | Retrieves and filters JIRA boards           | `BoardRepository`                     |
| `GetSprintsUseCase`        | Retrieves sprints with filtering            | `SprintRepository`                    |
| `GetIssueCommentsUseCase`  | Retrieves and filters issue comments        | `IssueCommentRepository`              |
| `GetProjectsUseCase`       | Retrieves and filters JIRA projects         | `ProjectRepository`                   |
| `GetAssignedIssuesUseCase` | Gets issues assigned to current user        | `IssueSearchRepository`               |
| `GetIssueUseCase`          | Retrieves issue details                     | `IssueRepository`                     |

## Usage Example

```typescript
// Example using a use case through dependency injection
constructor(
  private readonly getProjectsUseCase: GetProjectsUseCase,
  private readonly projectParamsValidator: ProjectParamsValidator
) {
  // ... handler initialization
}

// Using the use case
const validatedParams = this.projectParamsValidator.validateGetProjectsParams(params);
const projects = await this.getProjectsUseCase.execute(validatedParams);
```

## Design Decisions

1. **Separation of Concerns**: Each use case focuses on a single business operation
2. **Dependency Injection**: Dependencies are injected via constructor
3. **Error Transformation**: Errors are caught and transformed into domain-specific errors
4. **Repository Pattern**: All external data access is done through repositories
5. **Explicit Interface**: Each use case has a clearly defined interface
