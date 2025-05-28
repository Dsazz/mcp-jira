# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.3.1] - 2025-05-28

### Added

- **💬 JIRA Issue Comments Retrieval**: New jira_get_issue_comments tool with progressive disclosure parameters, advanced filtering, and rich formatting
- **🎨 Comments Formatting System**: Structured markdown display with ADF parsing and context-aware formatting

### Improved

- **Test Coverage**: Added 37 comprehensive test cases (230 total tests passing)
- **Code Organization**: New formatters and handlers following existing patterns

### Technical

- **Progressive Disclosure Pattern**: Successfully implemented and documented for reuse
- **Architectural Consistency**: Maintained consistency with existing tool patterns

## [0.3.0] - 2025-05-28

### Added

- **🔍 Advanced Issue Search Functionality**

  - New `search_jira_issues` tool with hybrid JQL + helper parameter support
  - Expert mode: Direct JQL query support for advanced users
  - Beginner mode: User-friendly filters (assignedToMe, project, status, text)
  - Flexible search options with configurable result limits (1-50, default: 25)
  - Rich search results formatting with issue previews and navigation links

- **📝 Atlassian Document Format (ADF) Parser**

  - Complete ADF to Markdown conversion for issue descriptions
  - Support for formatted text (bold, italic, code, strikethrough, links)
  - Document structure support (headings, paragraphs, lists, blockquotes, code blocks)
  - Special elements handling (hard breaks, horizontal rules)
  - Backward compatibility with plain text descriptions
  - Text extraction utilities for plain text output

- **🎨 Enhanced Formatting**
  - Card-based issue display with status icons and metadata
  - Description previews with intelligent truncation (100 chars)
  - Improved date formatting and status visualization
  - Action-oriented navigation links between tools

### Improved

- **Issue Details**: Descriptions now properly display formatted content instead of "[object Object]"
- **Type Safety**: Enhanced TypeScript definitions for ADF structures and search parameters
- **Error Handling**: Better validation and error messages for search parameters
- **Code Organization**: Improved modular architecture with dedicated utils and formatters

### Fixed

- **Description Parsing**: Resolved issue where complex JIRA descriptions appeared as "[object Object]"
- **Search Validation**: Proper parameter validation with clear error messages
- **Quote Escaping**: Fixed JQL text search parameter escaping for special characters

### Technical

- **Comprehensive Test Suite**: 62 unit tests covering ADF parsing, search functionality, and formatting
- **Schema Validation**: Robust Zod schemas for type-safe parameter validation
- **Documentation**: Updated README with new features and usage examples
- **Code Quality**: Maintained 100% TypeScript strict mode compliance

## [0.2.2] - Previous Release

### Features

- Basic JIRA issue retrieval
- Assigned issues listing
- Local task creation from JIRA issues
- MCP server implementation
