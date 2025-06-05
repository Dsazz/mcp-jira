# Changelog

All notable changes to the JIRA MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Additional JIRA worklog management features
- Enhanced performance optimizations
- Advanced JIRA automation workflows

## [0.5.1] - 2025-06-05

### 🐛 Critical Bug Fixes

- **🚨 JIRA Projects API Pagination Fixed**: Resolved `projects.map is not a function` error
  - **Issue**: JIRA `/project/search` API returns paginated responses with `{values: [...]}` structure
  - **Error**: Code expected direct arrays, causing `projects.map is not a function` when using `jira_get_projects`
  - **Fix**: Updated ProjectRepository to properly extract `values` array from paginated responses
  - **Impact**: Users can now successfully use `jira_get_projects` and `jira_get_projects searchQuery="..."` commands
  - **Location**: `src/features/jira/projects/repositories/project.repository.ts`

### 🔧 Technical Details

- **Root Cause**: JIRA API pagination structure mismatch in projects repository
- **Solution**: Added `PaginatedResponse<T>` and `ProjectSearchResponse` interfaces with proper value extraction
- **Validation**: All 829 tests passing with comprehensive coverage across all domains
- **Testing**: Enhanced mock factories and repository test coverage
- **Compatibility**: Fully backward compatible with no breaking changes

### 📋 Release Process

- **Type**: Patch release (0.5.0 → 0.5.1)
- **Priority**: High - resolves user-blocking issues
- **Compatibility**: Fully backward compatible
- **Dependencies**: No dependency changes required

## [0.5.0] - 2025-06-05

### 🆕 New Tools

- **📝 Worklog Management**: Complete worklog functionality for time tracking
  - `jira_add_worklog`: Add time entries to issues with comments and date specification
  - `jira_get_worklogs`: Retrieve worklog entries with date filtering
  - `jira_update_worklog`: Modify existing worklog entries
  - `jira_delete_worklog`: Remove worklog entries
- **👤 User Management**: Enhanced user operations
  - `jira_get_current_user`: Get current authenticated user information

### 🏗️ Architecture Overhaul

- **Modular Design**: Complete code reorganization with domain-driven structure (issues, projects, boards, sprints, users, worklogs)
- **Enhanced HTTP Client**: Rebuilt with dedicated utility classes for improved reliability and maintainability
- **822+ Tests**: Comprehensive test coverage including 95+ new tests for HTTP client utilities

### 🐛 Critical Fixes

- **URL Construction Bug**: Fixed malformed JIRA API URLs that prevented proper communication with JIRA Cloud
- **Enhanced Error Handling**: Improved error classification with actionable solutions

## [0.4.1] - 2025-06-04

### 🐛 Critical Bug Fixes

- **🚨 JIRA Issue Creation Fixed**: Resolved critical bug preventing JIRA issue creation
  - **Issue**: JIRA Cloud API now requires `permissions` query parameter for `mypermissions` endpoint
  - **Error**: `JiraApiError: The 'permissions' query parameter is required.`
  - **Fix**: Added `permissions: "CREATE_ISSUES"` parameter to project validation API call
  - **Impact**: Users can now successfully create JIRA issues through MCP integration
  - **Location**: `src/features/jira/api/jira.client.impl.ts` - `validateProject` method

### 🔧 Technical Details

- **Root Cause**: JIRA Cloud API policy change requiring explicit permission specification
- **Solution**: Updated `mypermissions` endpoint call to include required `permissions` parameter
- **Validation**: Verified fix with TypeScript compilation and build process
- **Testing**: Confirmed no regression in existing functionality

### 📋 Release Process

- **Type**: Patch release (0.4.0 → 0.4.1)
- **Priority**: Critical - affects core functionality
- **Compatibility**: Fully backward compatible
- **Dependencies**: No dependency changes required

## [0.4.0] - 2025-06-02

### 🚀 Major Features

- **🆕 Complete JIRA Issue Management Suite**: Full CRUD operations for JIRA issues

  - `jira_create_issue`: Create new issues with comprehensive field support
  - `jira_update_issue`: Update existing issues with field changes, status transitions, and worklog entries
  - Advanced field support including custom fields, time tracking, and array operations

- **📊 Project & Board Management**: Comprehensive JIRA workspace navigation
  - `jira_get_projects`: Browse and discover JIRA projects with filtering options
  - `jira_get_boards`: Access Scrum and Kanban boards with advanced filtering
  - `jira_get_sprints`: Sprint management for agile project workflows

### ✨ Enhanced Capabilities

- **🎯 Advanced Issue Creation**:

  - Support for all standard JIRA fields (priority, assignee, labels, components, versions)
  - Time tracking integration (estimates, due dates)
  - Custom field support for organization-specific workflows
  - ADF format support for rich descriptions

- **⚡ Powerful Issue Updates**:

  - Field-level updates with validation
  - Array operations (add/remove/set) for labels, components, and versions
  - Status transitions with workflow validation
  - Worklog entries with time tracking
  - Comprehensive error handling and validation

- **🔍 Enhanced Discovery Tools**:
  - Project browsing with metadata (description, lead, issue types)
  - Board filtering by type (Scrum/Kanban), project, and name
  - Sprint management with state filtering (active, closed, future)
  - Pagination support across all discovery tools

### 🏗️ Technical Improvements

- **📋 Comprehensive Test Suite**: 540+ tests covering all new functionality

  - Unit tests for all new handlers and formatters
  - Integration tests for end-to-end workflows
  - Mock factories for reliable testing
  - 100% test pass rate maintained

- **🎨 Rich Formatting System**:

  - Specialized formatters for each tool type
  - Consistent markdown output with action links
  - Error formatting with helpful suggestions
  - Progress indicators and status displays

- **🔧 Enhanced Error Handling**:

  - Detailed error messages with solution suggestions
  - Validation error formatting with field-specific guidance
  - Network error resilience with retry suggestions
  - Permission error handling with clear explanations

- **📚 Code Quality & Architecture**:
  - Biome integration for consistent code formatting
  - Import organization and standardization
  - TypeScript strict mode compliance
  - Modular architecture with clear separation of concerns

### 🛠️ Developer Experience

- **📖 Comprehensive Documentation**: Updated README with all new tools and examples
- **🧪 Testing Infrastructure**: Enhanced test utilities and mock systems
- **⚙️ Build System**: Optimized build process with proper TypeScript compilation
- **🔍 Code Quality**: Automated formatting and linting with Biome

### 🐛 Bug Fixes

- **Import Organization**: Fixed import ordering and standardization across codebase
- **Type Safety**: Resolved TypeScript compilation issues
- **Code Formatting**: Applied consistent formatting standards
- **Test Reliability**: Enhanced test stability and mock accuracy

### 📈 Performance & Reliability

- **Optimized API Calls**: Efficient JIRA API usage with proper pagination
- **Memory Management**: Improved resource handling in long-running operations
- **Error Recovery**: Better error handling and recovery mechanisms
- **Validation Performance**: Fast parameter validation with detailed feedback

## [0.3.1] - 2025-06-01

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
