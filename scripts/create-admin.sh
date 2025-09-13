#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/create-admin.sh --name "Admin Name" --email admin@example.com [--school-id 1] [--school-code system] [--firebase-uid abc]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT/backend"

go run ./cmd/admincli \
  "$@"

