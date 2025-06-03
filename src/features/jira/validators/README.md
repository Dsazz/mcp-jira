# Validators Layer

## Purpose

The Validators layer is responsible for input validation across the JIRA integration. It ensures that all parameters passed to use cases and repositories meet the required format and business rules.

## Architecture

Validators implement the following pattern:

1. **Interface Definition**: Each validator has a clear interface that defines its contract
2. **Validation Methods**: Methods for validating specific parameter types
3. **Implementation Class**: A concrete implementation that handles validation logic
4. **Error Throwing**: Throws specialized errors when validation fails
5. **Parameter Transformation**: Often returns a validated (and potentially transformed) copy of the input

## Components

| Validator                  | Purpose                                     | Validation Scope             |
| -------------------------- | ------------------------------------------- | ---------------------------- |
| `ProjectValidator`         | Validates project existence and issue types | Project keys, issue types    |
| `ProjectPermissionChecker` | Verifies user permissions for projects      | User permissions             |
| `BoardValidator`           | Validates board parameters                  | Board IDs, filter parameters |
| `SprintValidator`          | Validates sprint parameters                 | Sprint IDs, board IDs        |
| `IssueCommentValidator`    | Validates comment retrieval parameters      | Issue keys, comment filters  |
| `ProjectParamsValidator`   | Validates project retrieval parameters      | Project search parameters    |
| `IssueParamsValidator`     | Validates issue retrieval parameters        | Issue keys, field selections |

## Usage Example

```typescript
// Example using a validator through dependency injection
constructor(
  private readonly getProjectsUseCase: GetProjectsUseCase,
  private readonly projectParamsValidator: ProjectParamsValidator
) {
  // ... handler initialization
}

// Using the validator
try {
  const validatedParams = this.projectParamsValidator.validateGetProjectsParams(params);
  // Proceed with validated parameters
} catch (error) {
  // Handle validation errors
}
```

## Design Decisions

1. **Early Validation**: Validation happens as early as possible in the request lifecycle
2. **Detailed Error Messages**: Error messages are detailed and user-friendly
3. **Schema-Based Validation**: Uses Zod schemas for declarative validation rules
4. **Type Safety**: Validated parameters maintain TypeScript type safety
5. **Separation of Concerns**: Validators focus solely on validation, not business logic
