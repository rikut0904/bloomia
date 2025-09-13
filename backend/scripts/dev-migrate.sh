#!/bin/bash

# Development migration script
set -e

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Set default DATABASE_URL for development if not set
if [ -z "$DATABASE_URL" ]; then
    echo "Warning: DATABASE_URL not set, using default development database"
    export DATABASE_URL="postgres://postgres:password@localhost:5432/bloomia_dev?sslmode=disable"
fi

# Set default command to "up" if not specified
COMMAND=${1:-"up"}
NAME=${2:-""}

echo "Development Migration Tool"
echo "========================="
echo "Database: $DATABASE_URL"
echo "Command: $COMMAND"

case $COMMAND in
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
        if [ -z "$NAME" ]; then
            echo "Usage: $0 create <migration_name>"
            exit 1
        fi
        echo "Creating new migration: $NAME"
        go run cmd/migrate/main.go -cmd=create -name="$NAME"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command] [name]"
        echo ""
        echo "Commands:"
        echo "  up      - Apply all pending migrations (default)"
        echo "  down    - Rollback last migration"
        echo "  status  - Show migration status"
        echo "  create  - Create new migration (requires name)"
        echo "  help    - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 up"
        echo "  $0 create add_user_avatar_column"
        echo "  $0 status"
        ;;
    *)
        echo "ERROR: Unknown command: $COMMAND"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac

echo "Migration completed successfully!"