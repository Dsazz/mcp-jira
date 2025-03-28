#!/bin/bash
# Release script for v1.2.0

echo "Starting release process for v1.2.0..."

# Push the tag
echo "Pushing tag v1.2.0..."
git push origin v1.2.0

# Push the release branch
echo "Pushing release branch..."
git push origin release/v1.2.0

echo "Release v1.2.0 is ready!"
echo ""
echo "Manual steps remaining:"
echo "1. Create a PR from release/v1.2.0 to main branch"
echo "2. After PR is merged, create another PR from main to develop branch"
echo "3. After both PRs are merged, run: git branch -d release/v1.2.0"
echo ""
echo "For hotfixes, follow the hotfix process in CONTRIBUTING.md" 