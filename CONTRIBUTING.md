# Contributing

Thank you for your interest in contributing to the JIRA MCP Server project! This document provides guidelines for contributing and our version control workflow.

## 📦 Version Control and Release Process

### Branch Structure

- `main` - Production-ready code, always stable
- `dev` - Main development branch, integration point for features
- `feature/*` - New features and non-emergency fixes
- `release/*` - Release preparation branches
- `hotfix/*` - Emergency production fixes

### Development Workflow

#### 1. Feature Development

```bash
# Create a feature branch
git checkout dev
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: your commit message"

# Push your feature
git push origin feature/your-feature-name

# Create a pull request to dev branch
```

Requirements:

- Branch naming: `feature/descriptive-name`
- All tests must pass
- Code must be formatted with Biome
- PR description must include:
  - Purpose of changes
  - Testing performed
  - Screenshots (if UI changes)

#### 2. Release Process

```bash
# Create a release branch
git checkout dev
git checkout -b release/v0.2.0

# Update version in package.json
bun run version

# Commit version bump
git add package.json
git commit -m "chore: bump version to v0.2.0"

# Merge to main and dev
git checkout main
git merge release/v0.2.0 --no-ff
git tag -a v0.2.0 -m "Release v0.2.0"

git checkout dev
git merge release/v1.2.0 --no-ff

# Clean up
git branch -d release/v0.2.0
```

Requirements:

- Branch naming: `release/vX.Y.Z`
- All tests must pass on release branch
- Update CHANGELOG.md
- Create release notes
- Tag the release

#### 3. Hotfix Process

```bash
# Create hotfix branch
git checkout main
git checkout -b hotfix/v1.2.1

# Make fixes and update version
bun run version

# Commit and tag
git commit -am "fix: critical bug description"
git tag -a v1.2.1 -m "Hotfix v1.2.1"

# Merge to main and dev
git checkout main
git merge hotfix/v1.2.1 --no-ff

git checkout dev
git merge hotfix/v1.2.1 --no-ff
```

Requirements:

- Branch naming: `hotfix/vX.Y.Z`
- Only critical bug fixes
- Must include tests
- Update CHANGELOG.md

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Adding or modifying tests
- `chore:` Maintenance tasks

Examples:

```bash
git commit -m "feat(jira): add issue assignment feature"
git commit -m "fix: resolve connection timeout issue"
git commit -m "docs: update API documentation"
```

## Pull Request Process

1. **Before Creating a PR**

   - Ensure all tests pass
   - Run Biome formatting
   - Update documentation if needed
   - Add/update tests for new features

2. **PR Requirements**

   - Clear, descriptive title following commit message format
   - Detailed description of changes
   - Reference related issues
   - Screenshots for UI changes
   - All CI checks must pass

3. **Review Process**
   - At least one approval required
   - All comments must be resolved
   - CI checks must pass
   - No merge conflicts

## Development Setup

1. **Environment Setup**

   ```bash
   # Clone the repository
   git clone https://github.com/Dsazz/mcp-jira.git
   cd mcp-jira

   # Install dependencies
   bun install

   # Set up environment
   cp .env.example .env
   ```

2. **Pre-commit Checks**

   ```bash
   # Run tests
   bun run test

   # Format code
   bun biome format --write .

   # Check for issues
   bun biome check .
   ```

## Questions or Problems?

- Check existing issues
- Create a new issue with detailed information
- Join our community discussions

Thank you for contributing to make JIRA MCP Server better! 🚀
