# System Time Feature Tests

This directory contains unit tests for the System Time feature.

## Running Tests

To run all System Time tests:

```bash
npm test -- src/features/system-time/__tests__
```

To run a specific test file:

```bash
npm test -- src/features/system-time/__tests__/tools/get-time.tool.test.ts
```

## Test Coverage

The tests cover:

1. **Configuration** - Tests for `SystemTimeConfig` class
2. **Base Tool** - Tests for the abstract `SystemTimeTool` class
3. **Tool Implementation** - Tests for the concrete `GetTimeTool` implementation
4. **Formatters** - Tests for the `DateFormatter` class and future locale support
5. **Feature Registration** - Tests for the registration function that sets up MCP tools

Each test file focuses on ensuring that the component behaves correctly for:

- Normal operation with valid inputs
- Edge cases and boundary conditions
- Error handling and recovery

## Mock Strategy

Tests use Jest mocks to isolate components and test them independently:

- External dependencies like `date-fns` are mocked
- Shared utilities like logging are mocked
- Component dependencies are mocked when testing higher-level components

## Future Enhancements

The test suite includes skipped tests for future enhancements:

1. **Locale Support** - Tests for adding date-fns locale support to the DateFormatter
   - Tests demonstrate how to format dates in English, Spanish, French, and Japanese
   - Implementation would require extending the DateFormatOptions interface with a locale property
