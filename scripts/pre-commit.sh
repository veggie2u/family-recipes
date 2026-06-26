#!/bin/sh
# Auto-bump patch version on each commit.
# Skip if package.json is already staged (manual version:minor / version:major bump).
if git diff --cached --name-only | grep -q "^package\.json$"; then
  exit 0
fi
npm --no-git-tag-version version patch
git add package.json package-lock.json
