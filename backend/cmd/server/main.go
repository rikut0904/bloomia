package main

// Railway deployment hotfix - v1.0.2

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rikut0904/bloomia/backend/internal/database"
	"github.com/rikut0904/bloomia/backend/internal/redis"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

type HealthStatus struct {
	Status      string            `json:"status"`
	Environment string            `json:"environment"`
	Version     string            `json:"version"`
	Theme       string            `json:"theme"`
	Background  string            `json:"background"`
	Services    map[string]string `json:"services"`
	Timestamp   time.Time         `json:"timestamp"`
}

func main() {
	// Load environment variables from .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database connection
	if err := database.InitDatabase(); err != nil {
		log.Printf("Failed to initialize database: %v", err)
		// Continue without database for now
	}

	// Initialize Redis connection
	if err := redis.InitRedis(); err != nil {
		log.Printf("Failed to initialize Redis: %v", err)
		// Continue without Redis for now
	}

	// Setup graceful shutdown
	defer func() {
		database.CloseDatabase()
		redis.CloseRedis()
	}()

	// Handle graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		log.Println("Shutting down gracefully...")
		database.CloseDatabase()
		redis.CloseRedis()
		os.Exit(0)
	}()

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Create router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://*.vercel.app", "https://bloomia.com"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Security headers middleware
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("X-Frame-Options", "DENY")
			w.Header().Set("X-XSS-Protection", "1; mode=block")
			w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
			next.ServeHTTP(w, r)
		})
	})

	// Routes
	r.Get("/", rootHandler)
	r.Get("/health", healthHandler)
	r.Get("/api/v1/health", healthHandler)

	// API routes group
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/status", healthHandler)
	})

	log.Printf("Bloomia Backend starting on port %s", port)
	log.Printf("Theme: %s, Background: %s", getEnvOrDefault("DEFAULT_THEME_COLOR", "#FF7F50"), getEnvOrDefault("DEFAULT_BACKGROUND_COLOR", "#fdf8f0"))
	
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"message":    "Bloomia API Server",
		"version":    "1.0.0",
		"theme":      getEnvOrDefault("DEFAULT_THEME_COLOR", "#FF7F50"),
		"background": getEnvOrDefault("DEFAULT_BACKGROUND_COLOR", "#fdf8f0"),
		"endpoints": map[string]string{
			"health": "/health",
			"api":    "/api/v1",
		},
		"timestamp": time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	services := map[string]string{
		"server": "healthy",
	}

	// Check database health
	if err := database.HealthCheck(); err != nil {
		services["database"] = "unhealthy: " + err.Error()
	} else {
		services["database"] = "healthy"
	}

	// Check Redis health
	if err := redis.HealthCheck(); err != nil {
		services["redis"] = "unhealthy: " + err.Error()
	} else {
		services["redis"] = "healthy"
	}

	// Determine overall status
	status := "healthy"
	for _, serviceStatus := range services {
		if serviceStatus != "healthy" && serviceStatus != "server" {
			status = "degraded"
			break
		}
	}

	health := HealthStatus{
		Status:      status,
		Environment: getEnvOrDefault("APP_ENV", "development"),
		Version:     "1.0.2",
		Theme:       getEnvOrDefault("DEFAULT_THEME_COLOR", "#FF7F50"),
		Background:  getEnvOrDefault("DEFAULT_BACKGROUND_COLOR", "#fdf8f0"),
		Services:    services,
		Timestamp:   time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(health)
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}