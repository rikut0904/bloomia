package main

import (
	"encoding/json"
	"log"
	"net/http"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	r := chi.NewRouter()
	
	// CORS設定
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Auth endpoints
	r.Post("/api/v1/auth/verify", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"success": true,
			"user": map[string]interface{}{
				"uid":          "dummy-uid",
				"email":        "admin@example.com",
				"display_name": "Admin User",
				"role":         "admin",
				"school_id":    "school1",
			},
			"message": "User verified successfully (development mode)",
		}
		json.NewEncoder(w).Encode(response)
	})

	// Admin user endpoints
	r.Get("/api/v1/admin/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		userID := chi.URLParam(r, "id")
		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"success": true,
			"user": map[string]interface{}{
				"uid":          userID,
				"email":        "admin@example.com",
				"display_name": "Admin User",
				"role":         "admin",
				"school_id":    "school1",
				"status":       "active",
			},
		}
		json.NewEncoder(w).Encode(response)
	})

	log.Println("Starting dummy server on :8080")
	http.ListenAndServe(":8080", r)
}