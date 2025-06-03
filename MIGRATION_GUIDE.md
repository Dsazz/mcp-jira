# JIRA Client Architecture Migration Guide

## Overview

This guide helps you migrate from the legacy `JiraClient` god object (1,127 lines) to the new modular architecture based on SOLID principles. The migration is designed to be gradual and non-breaking.

## Migration Strategies

### 1. Adapter Pattern (Recommended for Immediate Migration)

The adapter pattern provides 100% backward compatibility while internally using the new architecture.

**Before:**

```typescript
import { JiraClient } from "@features/jira/api/jira.client.impl";

const client = new JiraClient(jiraConfig);
const issue = await client.getIssue("TEST-123");
```

**After:**

```typescript
import { createJiraClientAdapter } from "@features/jira/adapters/jira-client.adapter";

const client = createJiraClientAdapter(jiraConfig);
const issue = await client.getIssue("TEST-123"); // Same API!
```

### 2. Direct Repository Usage (Recommended for New Features)

For new features, use repositories directly for better testability and separation of concerns.

**Example:**

```typescript
import { IssueRepositoryImpl } from "@features/jira/repositories/issue.repository";
import { JiraHttpClient } from "@features/jira/api/jira.http-client.impl";

const httpClient = new JiraHttpClient(jiraConfig);
const issueRepository = new IssueRepositoryImpl(httpClient);
const issue = await issueRepository.getIssue("TEST-123");
```

### 3. UseCase Pattern (Recommended for Complex Operations)

For complex business operations, use the UseCase pattern.

**Example:**

```typescript
import { CreateIssueUseCaseImpl } from "@features/jira/use-cases/create-issue.use-case";

const createIssueUseCase = new CreateIssueUseCaseImpl(
  issueRepository,
  projectValidator,
  projectPermissionChecker
);

const issue = await createIssueUseCase.execute({
  projectKey: "TEST",
  summary: "New issue",
  issueType: "Task",
  description: "Issue description",
});
```

## Migration Steps by Component Type

### Handler Migration

1. **Update imports:**

   ```typescript
   // Before
   import { JiraClient } from "@features/jira/api/jira.client.impl";

   // After
   import {
     MigrationClientFactory,
     MigrationStrategy,
   } from "@features/jira/migration/migration-utilities";
   ```

2. **Replace client creation:**

   ```typescript
   // Before
   const client = new JiraClient(jiraConfig);

   // After
   const client = MigrationClientFactory.createClient(jiraConfig, {
     strategy: MigrationStrategy.ADAPTER,
   });
   ```

3. **Test functionality** - All existing code should work without changes

4. **Consider repository injection** for better testability:
   ```typescript
   // Future migration
   constructor(
     private readonly issueRepository: IssueRepository,
     private readonly projectRepository: ProjectRepository
   ) {}
   ```

### Test Migration

1. **Update test setup:**

   ```typescript
   // Before
   const mockClient = {
     getIssue: jest.fn(),
     createIssue: jest.fn(),
   } as unknown as JiraClient;

   // After
   import { RepositoryMockFactory } from "@test/utils/repository-test.utils";

   const mockIssueRepository =
     RepositoryMockFactory.createMockIssueRepository();
   const mockProjectRepository =
     RepositoryMockFactory.createMockProjectRepository();
   ```

2. **Use test data factories:**

   ```typescript
   import { TestDataFactory } from "@test/utils/repository-test.utils";

   const sampleIssue = TestDataFactory.createSampleIssue({
     key: "TEST-123",
     fields: { summary: "Test issue" },
   });
   ```

3. **Update assertions:**

   ```typescript
   import { TestAssertions } from "@test/utils/repository-test.utils";

   TestAssertions.assertRepositoryMethodCalled(
     mockIssueRepository,
     "getIssue",
     ["TEST-123"]
   );
   ```

## Architecture Benefits

### Before (Legacy JiraClient)

- ❌ 1,127 lines in single class
- ❌ 20+ different responsibilities
- ❌ High coupling, low cohesion
- ❌ Difficult to test and mock
- ❌ Violates Single Responsibility Principle

### After (New Architecture)

- ✅ 9 focused repositories (average 100 lines each)
- ✅ Single responsibility per component
- ✅ High cohesion, low coupling
- ✅ Easy to test with focused mocks
- ✅ Follows SOLID principles
- ✅ UseCase pattern for complex operations
- ✅ Interface segregation

## Component Mapping

| Legacy Method        | New Component            | Notes                          |
| -------------------- | ------------------------ | ------------------------------ |
| `getIssue()`         | `IssueRepository`        | Direct mapping                 |
| `searchIssues()`     | `IssueSearchRepository`  | Specialized for search         |
| `getIssueComments()` | `IssueCommentRepository` | Comment-specific operations    |
| `createIssue()`      | `CreateIssueUseCase`     | Complex validation logic       |
| `updateIssue()`      | `UpdateIssueUseCase`     | Handles transitions & worklogs |
| `getProjects()`      | `ProjectRepository`      | Project data operations        |
| `validateProject()`  | `ProjectValidator`       | Validation logic separated     |
| `getBoards()`        | `BoardRepository`        | Agile board operations         |
| `getSprints()`       | `SprintRepository`       | Sprint management              |

## Testing Strategy

### Repository Testing

```typescript
import {
  RepositoryMockFactory,
  TestDataFactory,
} from "@test/utils/repository-test.utils";

describe("IssueRepository", () => {
  let repository: IssueRepository;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = RepositoryMockFactory.createMockHttpClient();
    repository = new IssueRepositoryImpl(mockHttpClient);
  });

  it("should get issue by key", async () => {
    const expectedIssue = TestDataFactory.createSampleIssue();
    mockHttpClient.sendRequest.mockResolvedValue(expectedIssue);

    const result = await repository.getIssue("TEST-123");

    expect(result).toEqual(expectedIssue);
    expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
      endpoint: "issue/TEST-123",
      method: "GET",
    });
  });
});
```

### UseCase Testing

```typescript
describe("CreateIssueUseCase", () => {
  let useCase: CreateIssueUseCase;
  let mockIssueRepository: IssueRepository;
  let mockProjectValidator: ProjectValidator;

  beforeEach(() => {
    mockIssueRepository = RepositoryMockFactory.createMockIssueRepository();
    mockProjectValidator = RepositoryMockFactory.createMockProjectValidator();

    useCase = new CreateIssueUseCaseImpl(
      mockIssueRepository,
      mockProjectValidator,
      mockProjectPermissionChecker
    );
  });

  it("should create issue with validation", async () => {
    const project = TestDataFactory.createSampleProject();
    const expectedIssue = TestDataFactory.createSampleIssue();

    mockProjectValidator.validateProject.mockResolvedValue(project);
    mockIssueRepository.createIssue.mockResolvedValue(expectedIssue);

    const result = await useCase.execute({
      projectKey: "TEST",
      summary: "New issue",
      issueType: "Task",
    });

    expect(result).toEqual(expectedIssue);
    expect(mockProjectValidator.validateProject).toHaveBeenCalledWith("TEST");
  });
});
```

## Performance Considerations

The new architecture provides several performance benefits:

1. **Reduced Object Creation**: Repositories are lightweight and focused
2. **Better Caching**: Each repository can implement domain-specific caching
3. **Parallel Operations**: Independent repositories can be called in parallel
4. **Memory Efficiency**: No large god object in memory

## Migration Timeline

### Phase 1: Immediate (Week 1)

- Replace `JiraClient` with `MigrationClientFactory.createClient()`
- Use `MigrationStrategy.ADAPTER` for backward compatibility
- Update imports across codebase

### Phase 2: Gradual (Weeks 2-4)

- Migrate tests to use repository mock factories
- Update new features to use repositories directly
- Implement UseCase pattern for complex operations

### Phase 3: Optimization (Weeks 5-8)

- Remove adapter pattern where possible
- Implement direct repository injection
- Optimize performance with focused repositories

### Phase 4: Cleanup (Week 9)

- Remove legacy `JiraClient` class
- Clean up unused imports and dependencies
- Update documentation

## Troubleshooting

### Common Issues

1. **Import Errors**

   ```
   Error: Cannot find module '@features/jira/adapters/jira-client.adapter'
   ```

   **Solution**: Ensure all new files are properly exported in index files

2. **Type Errors**

   ```
   Error: Type 'JiraClientAdapter' is not assignable to type 'JiraApiClient'
   ```

   **Solution**: The adapter implements the same interface - check import paths

3. **Mock Errors in Tests**
   ```
   Error: jest.fn() is not a function
   ```
   **Solution**: Update to use Bun test mocks: `mock()` from "bun:test"

### Migration Validation

Use the built-in compatibility checker:

```typescript
import { CompatibilityChecker } from "@features/jira/migration/migration-utilities";

const result = await CompatibilityChecker.checkMigrationReadiness();
console.log("Migration ready:", result.ready);
console.log("Issues:", result.issues);
console.log("Recommendations:", result.recommendations);
```

## Support

For migration support:

1. Check this guide first
2. Review the test utilities documentation
3. Examine existing repository implementations
4. Use the migration utilities for validation

The migration is designed to be safe and gradual. Take your time and test thoroughly at each step.
