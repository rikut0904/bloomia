package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/database"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/migration"
)

func main() {
	var (
		command = flag.String("cmd", "", "Migration command: up, down, status, create")
		name    = flag.String("name", "", "Migration name (for create command)")
	)
	flag.Parse()

	if *command == "" {
		fmt.Println("Usage: go run cmd/migrate/main.go -cmd=<up|down|status|create> [-name=<migration_name>]")
		os.Exit(1)
	}

	// Load configuration
	cfg := config.Load()

	// Get migrations directory
	migrationsDir := filepath.Join(".", "migrations")
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		if err := os.MkdirAll(migrationsDir, 0755); err != nil {
			log.Fatalf("Failed to create migrations directory: %v", err)
		}
	}

	// Handle create command (doesn't need database connection)
	if *command == "create" {
		if *name == "" {
			log.Fatal("Migration name is required for create command")
		}
		if err := migration.CreateMigration(migrationsDir, *name); err != nil {
			log.Fatalf("Failed to create migration: %v", err)
		}
		return
	}

	// Connect to database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	migrator := migration.NewMigrator(db, migrationsDir)
	ctx := context.Background()

	switch *command {
	case "up":
		if err := migrator.Up(ctx); err != nil {
			log.Fatalf("Migration up failed: %v", err)
		}
	case "down":
		if err := migrator.Down(ctx); err != nil {
			log.Fatalf("Migration down failed: %v", err)
		}
	case "status":
		if err := migrator.Status(ctx); err != nil {
			log.Fatalf("Migration status failed: %v", err)
		}
	default:
		fmt.Printf("Unknown command: %s\n", *command)
		fmt.Println("Available commands: up, down, status, create")
		os.Exit(1)
	}
}