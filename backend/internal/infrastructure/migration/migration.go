package migration

import (
	"context"
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type Migration struct {
	Version   string
	Name      string
	UpSQL     string
	DownSQL   string
	Timestamp time.Time
}

type Migrator struct {
	db           *sql.DB
	migrationsDir string
}

func NewMigrator(db *sql.DB, migrationsDir string) *Migrator {
	return &Migrator{
		db:           db,
		migrationsDir: migrationsDir,
	}
}

// InitMigrationTable creates the migrations table if it doesn't exist
func (m *Migrator) InitMigrationTable(ctx context.Context) error {
	query := `
	CREATE TABLE IF NOT EXISTS schema_migrations (
		version VARCHAR(255) PRIMARY KEY,
		name TEXT NOT NULL,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`
	
	_, err := m.db.ExecContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}
	
	log.Println("Migrations table initialized")
	return nil
}

// GetAppliedMigrations returns list of applied migration versions
func (m *Migrator) GetAppliedMigrations(ctx context.Context) ([]string, error) {
	query := "SELECT version FROM schema_migrations ORDER BY version"
	rows, err := m.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query applied migrations: %w", err)
	}
	defer rows.Close()

	var versions []string
	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return nil, fmt.Errorf("failed to scan migration version: %w", err)
		}
		versions = append(versions, version)
	}

	return versions, nil
}

// LoadMigrations loads all migration files from the migrations directory
func (m *Migrator) LoadMigrations() ([]*Migration, error) {
	files, err := ioutil.ReadDir(m.migrationsDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	var migrations []*Migration
	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".sql") {
			continue
		}

		// Parse filename: YYYYMMDDHHMMSS_migration_name.sql
		name := file.Name()
		if len(name) < 15 {
			continue
		}

		version := name[:14] // YYYYMMDDHHMMSS
		migrationName := strings.TrimSuffix(name[15:], ".sql")

		content, err := ioutil.ReadFile(filepath.Join(m.migrationsDir, file.Name()))
		if err != nil {
			return nil, fmt.Errorf("failed to read migration file %s: %w", file.Name(), err)
		}

		// Split up and down migrations
		parts := strings.Split(string(content), "-- +migrate Down")
		upSQL := strings.TrimSpace(strings.Replace(parts[0], "-- +migrate Up", "", 1))
		downSQL := ""
		if len(parts) > 1 {
			downSQL = strings.TrimSpace(parts[1])
		}

		timestamp, err := time.Parse("20060102150405", version)
		if err != nil {
			log.Printf("Warning: Invalid timestamp in migration file %s", file.Name())
			timestamp = time.Now()
		}

		migration := &Migration{
			Version:   version,
			Name:      migrationName,
			UpSQL:     upSQL,
			DownSQL:   downSQL,
			Timestamp: timestamp,
		}

		migrations = append(migrations, migration)
	}

	// Sort by version
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

// Up runs all pending migrations
func (m *Migrator) Up(ctx context.Context) error {
	if err := m.InitMigrationTable(ctx); err != nil {
		return err
	}

	applied, err := m.GetAppliedMigrations(ctx)
	if err != nil {
		return err
	}

	appliedMap := make(map[string]bool)
	for _, version := range applied {
		appliedMap[version] = true
	}

	migrations, err := m.LoadMigrations()
	if err != nil {
		return err
	}

	for _, migration := range migrations {
		if appliedMap[migration.Version] {
			log.Printf("Migration %s already applied, skipping", migration.Version)
			continue
		}

		log.Printf("Applying migration %s: %s", migration.Version, migration.Name)

		tx, err := m.db.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("failed to begin transaction: %w", err)
		}

		// Execute migration
		if _, err := tx.ExecContext(ctx, migration.UpSQL); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to execute migration %s: %w", migration.Version, err)
		}

		// Record migration
		if _, err := tx.ExecContext(ctx, 
			"INSERT INTO schema_migrations (version, name) VALUES ($1, $2)",
			migration.Version, migration.Name); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration %s: %w", migration.Version, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration %s: %w", migration.Version, err)
		}

		log.Printf("Successfully applied migration %s", migration.Version)
	}

	log.Println("All migrations applied successfully")
	return nil
}

// Down rolls back the last migration
func (m *Migrator) Down(ctx context.Context) error {
	applied, err := m.GetAppliedMigrations(ctx)
	if err != nil {
		return err
	}

	if len(applied) == 0 {
		log.Println("No migrations to rollback")
		return nil
	}

	lastVersion := applied[len(applied)-1]
	migrations, err := m.LoadMigrations()
	if err != nil {
		return err
	}

	var targetMigration *Migration
	for _, migration := range migrations {
		if migration.Version == lastVersion {
			targetMigration = migration
			break
		}
	}

	if targetMigration == nil {
		return fmt.Errorf("migration file for version %s not found", lastVersion)
	}

	if targetMigration.DownSQL == "" {
		return fmt.Errorf("no down migration defined for version %s", lastVersion)
	}

	log.Printf("Rolling back migration %s: %s", targetMigration.Version, targetMigration.Name)

	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Execute rollback
	if _, err := tx.ExecContext(ctx, targetMigration.DownSQL); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute rollback %s: %w", targetMigration.Version, err)
	}

	// Remove migration record
	if _, err := tx.ExecContext(ctx, 
		"DELETE FROM schema_migrations WHERE version = $1", lastVersion); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to remove migration record %s: %w", lastVersion, err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit rollback %s: %w", lastVersion, err)
	}

	log.Printf("Successfully rolled back migration %s", lastVersion)
	return nil
}

// Status shows migration status
func (m *Migrator) Status(ctx context.Context) error {
	if err := m.InitMigrationTable(ctx); err != nil {
		return err
	}

	applied, err := m.GetAppliedMigrations(ctx)
	if err != nil {
		return err
	}

	appliedMap := make(map[string]bool)
	for _, version := range applied {
		appliedMap[version] = true
	}

	migrations, err := m.LoadMigrations()
	if err != nil {
		return err
	}

	fmt.Println("Migration Status:")
	fmt.Println("=================")
	
	for _, migration := range migrations {
		status := "PENDING"
		if appliedMap[migration.Version] {
			status = "APPLIED"
		}
		fmt.Printf("%s | %s | %s\n", migration.Version, status, migration.Name)
	}

	return nil
}

// CreateMigration creates a new migration file
func CreateMigration(migrationsDir, name string) error {
	timestamp := time.Now().Format("20060102150405")
	filename := fmt.Sprintf("%s_%s.sql", timestamp, name)
	filepath := filepath.Join(migrationsDir, filename)

	content := fmt.Sprintf(`-- +migrate Up
-- Write your migration here

-- +migrate Down
-- Write your rollback here
`)

	err := ioutil.WriteFile(filepath, []byte(content), 0644)
	if err != nil {
		return fmt.Errorf("failed to create migration file: %w", err)
	}

	fmt.Printf("Created migration file: %s\n", filepath)
	return nil
}