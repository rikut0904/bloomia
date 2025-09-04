package app

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/redis/go-redis/v9"

	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/database"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/firebase"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/middleware"
	adminRepo "github.com/rikut0904/bloomia/backend/internal/infrastructure/repository/admin"
	dashboardRepo "github.com/rikut0904/bloomia/backend/internal/infrastructure/repository/dashboard"
	redisRepo "github.com/rikut0904/bloomia/backend/internal/infrastructure/repository/redis"
	userRepo "github.com/rikut0904/bloomia/backend/internal/infrastructure/repository/user"
	httpHandler "github.com/rikut0904/bloomia/backend/internal/interface/http"
	"github.com/rikut0904/bloomia/backend/internal/usecase"
)

type App struct {
	router *chi.Mux
	config *config.Config
	db     *sql.DB
	redis  *redis.Client
}

func NewApp(cfg *config.Config) (*App, error) {
	// データベース接続
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}

	// Redis接続
	redisClient := database.ConnectRedis(cfg.RedisURL)

	// Firebase接続（開発環境では無効化）
	var firebaseClient *firebase.FirebaseClient
	// 開発環境ではFirebase Admin SDKを使用しない
	if cfg.FirebaseProjectID != "" && cfg.Environment == "production" {
		firebaseClient, err = firebase.NewFirebaseClient()
		if err != nil {
			return nil, fmt.Errorf("failed to initialize Firebase: %w", err)
		}
	}

	// リポジトリ初期化
	userRepository := userRepo.NewUserRepository(db)
	_ = redisRepo.NewRedisRepository(redisClient) // 将来使用予定
	dashboardRepository := dashboardRepo.NewDashboardRepository(db)
	adminRepository := adminRepo.NewAdminRepository(db)

	// ユースケース初期化
	authUsecase := usecase.NewAuthUsecase(userRepository, adminRepository)
	dashboardUsecase := usecase.NewDashboardUsecase(userRepository, cfg)
	dashboardUsecase.SetDashboardRepository(dashboardRepository)
	adminUsecase := usecase.NewAdminUsecase(adminRepository, userRepository, cfg)

	// ハンドラー初期化
	authHandler := httpHandler.NewAuthHandler(authUsecase)
	dashboardHandler := httpHandler.NewDashboardHandler(dashboardUsecase)
	adminHandler := httpHandler.NewAdminHandler(adminUsecase)

	// ルーター設定
	router := chi.NewRouter()
	setupMiddleware(router, cfg)
	setupRoutes(router, authHandler, dashboardHandler, adminHandler, firebaseClient, cfg)

	return &App{
		router: router,
		config: cfg,
		db:     db,
		redis:  redisClient,
	}, nil
}

func (a *App) Run(addr string) error {
	log.Printf("Starting server on %s", addr)
	return http.ListenAndServe(addr, a.router)
}

func setupMiddleware(r *chi.Mux, cfg *config.Config) {
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	
	// CORS設定
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.FrontendURL, "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// カスタムヘルスチェック
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
}

func setupRoutes(r *chi.Mux, authHandler *httpHandler.AuthHandler, dashboardHandler *httpHandler.DashboardHandler, adminHandler *httpHandler.AdminHandler, firebaseClient *firebase.FirebaseClient, cfg *config.Config) {
	// Firebase認証ミドルウェア（FirebaseClientが設定されている場合のみ）
	var firebaseAuthMiddleware func(http.Handler) http.Handler
	if firebaseClient != nil {
		firebaseAuthMiddleware = middleware.FirebaseAuthMiddleware(firebaseClient)
	}

	// 認証不要のルート
	r.Route("/api/v1", func(r chi.Router) {
		// 認証関連
		r.Post("/auth/register", authHandler.RegisterUser)
		
		// 認証が必要なルート
		r.Group(func(r chi.Router) {
			if firebaseAuthMiddleware != nil {
				r.Use(firebaseAuthMiddleware)
			}
			
			// ダッシュボード
			r.Get("/dashboard", dashboardHandler.GetDashboard)
			r.Get("/dashboard/tasks", dashboardHandler.GetTasks)
			r.Get("/dashboard/stats", dashboardHandler.GetStats)
			
			        // 管理者機能
        r.Get("/admin/users", adminHandler.GetAllUsers)
        r.Put("/admin/users/role", adminHandler.UpdateUserRole)
        r.Put("/admin/users/status", adminHandler.UpdateUserStatus)
        r.Post("/admin/invite", adminHandler.InviteUser)
        r.Get("/admin/schools", adminHandler.GetAllSchools)
        r.Get("/admin/stats", adminHandler.GetUserStats)
		})
	})
}