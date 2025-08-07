#!/bin/bash

# Release script for nitro-router
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to patch if no argument provided
VERSION_TYPE=${1:-patch}

echo -e "${BLUE}🚀 Starting release process for nitro-router${NC}"
echo -e "${YELLOW}Version type: ${VERSION_TYPE}${NC}"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ You must be on the main branch to create a release${NC}"
    echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"
    exit 1
fi

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Working directory is not clean. Please commit or stash changes.${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin main

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
bun install

# Run tests and checks
echo -e "${BLUE}🧪 Running tests and checks...${NC}"
bun run lint
bun run type-check
bun run build:clean

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"

# Bump version
echo -e "${BLUE}⬆️ Bumping version...${NC}"
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

# Update CHANGELOG
echo -e "${BLUE}📝 Updating CHANGELOG...${NC}"
DATE=$(date +"%Y-%m-%d")

# Create backup of CHANGELOG
cp CHANGELOG.md CHANGELOG.md.backup

# Add new version entry to CHANGELOG
cat > CHANGELOG.md.tmp << EOF
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [${NEW_VERSION}] - ${DATE}

### Added
- New features and improvements

### Changed
- Updates and modifications

### Fixed
- Bug fixes

EOF

# Append the rest of the changelog (skip the header)
tail -n +9 CHANGELOG.md.backup >> CHANGELOG.md.tmp
mv CHANGELOG.md.tmp CHANGELOG.md
rm CHANGELOG.md.backup

# Commit changes
echo -e "${BLUE}💾 Committing changes...${NC}"
git add package.json CHANGELOG.md
git commit -m "chore: bump version to ${NEW_VERSION}"

# Create and push tag
echo -e "${BLUE}🏷️ Creating and pushing tag...${NC}"
git tag ${NEW_VERSION}
git push origin main
git push origin ${NEW_VERSION}

echo -e "${GREEN}✅ Release ${NEW_VERSION} has been created and pushed!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "  1. Check GitHub Actions for the publishing workflow"
echo -e "  2. Verify the package on NPM: https://www.npmjs.com/package/nitro-router"
echo -e "  3. Update the GitHub release notes if needed"
echo -e "${BLUE}🎉 Happy releasing!${NC}"
