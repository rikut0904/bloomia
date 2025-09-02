package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

// InitDatabase initializes the PostgreSQL database connection
func InitDatabase() error {
	// Railway PostgreSQL connection
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		// Fallback to individual environment variables
		host := os.Getenv("PGHOST")
		port := os.Getenv("PGPORT")
		user := os.Getenv("PGUSER")
		password := os.Getenv("PGPASSWORD")
		dbname := os.Getenv("PGDATABASE")
		
		if port == "" {
			port = "5432"
		}
		
		databaseURL = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
			host, port, user, password, dbname)
	}

	var err error
	DB, err = sql.Open("postgres", databaseURL)
	if err != nil {
		return fmt.Errorf("failed to open database connection: %w", err)
	}

	// Configure connection pool
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(time.Hour)

	// Test the connection
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Successfully connected to PostgreSQL database")
	return nil
}

// CloseDatabase closes the database connection
func CloseDatabase() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection closed")
	}
}

// HealthCheck checks if the database is reachable
func HealthCheck() error {
	if DB == nil {
		return fmt.Errorf("database connection is nil")
	}
	return DB.Ping()
}