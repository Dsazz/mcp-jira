# JIRA Module Test Suite

This directory contains unit tests for the JIRA module, organized to match the structure of the module itself.

## Running Tests

To run all tests:

```bash
npm test
```

## Testing Approach

The tests in this suite follow these principles:

1. **Isolation**: Components are tested in isolation with dependencies mocked
2. **Completeness**: Both success and error paths are tested
3. **Behavior focus**: Tests focus on behavior, not implementation details
4. **Readability**: Tests use Arrange-Act-Assert pattern for clarity

## Mocking Strategy

- External dependencies (like the Jira API) are mocked
- Internal dependencies are also mocked to isolate component behavior
- The mock implementations aim to be minimal but sufficient

## Test Coverage

The test suite aims to provide comprehensive coverage of:

- API client functionality
- Tool implementations
- Formatters
- Validation logic
- Error handling

## Using Reusable Test Mocks

This test suite includes reusable mocks for common dependencies that can be shared across multiple test files. These mocks help improve maintainability and consistency across tests.

### Available Mocks

The following mocks are available in the `__mocks__` directory:

- **API Client Mocks**: Mock implementations of JIRA API client methods
- **Logger Mocks**: Mock implementations of the logger
- **Formatter Mocks**: Mock implementations of JIRA formatters
- **Config Mocks**: Mock implementations of JIRA configuration
- **Test Utilities**: Helper functions for common assertions

### Setting Up Mocks in Tests

There are two main approaches to setting up mocks in your tests:

#### 1. Manual Jest Mock Setup

Place this at the top of your test file, before your imports:

```typescript
// Mock the logger before importing the module
jest.mock("../../../../shared/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { MyComponent } from "../../components/my-component";
import { logger } from "../../../../shared/logger";
```

#### 2. Using Reusable Mock Setup

```typescript
import { setupLoggerMock, clearLoggerMocks, mockLogger } from "./__mocks__";

describe("My Component", () => {
  beforeAll(() => {
    setupLoggerMock();
  });

  beforeEach(() => {
    clearLoggerMocks();
  });

  it("should log messages", () => {
    // Your test code
    expect(mockLogger.info).toHaveBeenCalled();
  });
});
```

### Example: Setting Up All Mocks

You can set up all mocks at once using the `setupAllMocks` utility:

```typescript
import { setupAllMocks, clearAllMocks } from "./__mocks__";

describe("My Component", () => {
  beforeAll(() => {
    setupAllMocks();
  });

  beforeEach(() => {
    clearAllMocks();
  });

  // Your tests...
});
```

### Reusable Test Data

The API mock includes standard test issues that can be reused across tests:

```typescript
import { testIssues } from "./__mocks__";

it("should format an issue", () => {
  const result = formatter.format(testIssues.basic);
  // Assertions...
});

it("should format a list of issues", () => {
  const result = formatter.format(testIssues.list);
  // Assertions...
});
```

### Reusable Assertions

The test utilities include reusable assertions for common checks:

```typescript
import { expectSuccessResponse, expectErrorResponse } from "./__mocks__";

it("should return a success response", async () => {
  const result = await tool.handler({});
  expectSuccessResponse(result, "Expected text in the response");
});

it("should return an error response", async () => {
  const result = await tool.handler({});
  expectErrorResponse(result, "ERROR_CODE", "Expected error message");
});
```
