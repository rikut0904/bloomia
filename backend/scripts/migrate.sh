#!/bin/bash

# Migration script for production environment
set -e

echo "Starting database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Set default command to "up" if not specified
MIGRATION_COMMAND=${MIGRATION_COMMAND:-"up"}

# Run migration
cd /app
echo "Running migration command: $MIGRATION_COMMAND"

case $MIGRATION_COMMAND in
    "up")
        echo "Applying all pending migrations..."
        go run cmd/migrate/main.go -cmd=up
        ;;
    "down")
        echo "Rolling back last migration..."
        go run cmd/migrate/main.go -cmd=down
        ;;
    "status")
        echo "Showing migration status..."
        go run cmd/migrate/main.go -cmd=status
        ;;
    "create")
        if [ -z "$MIGRATION_NAME" ]; then
            echo "ERROR: MIGRATION_NAME environment variable is required for create command"
            exit 1
        fi
        echo "Creating new migration: $MIGRATION_NAME"
        go run cmd/migrate/main.go -cmd=create -name="$MIGRATION_NAME"
        ;;
    *)
        echo "ERROR: Unknown migration command: $MIGRATION_COMMAND"
        echo "Available commands: up, down, status, create"
        exit 1
        ;;
esac

echo "Migration completed successfully!"