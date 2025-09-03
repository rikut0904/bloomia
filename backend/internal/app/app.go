package app

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/redis/go-redis/v9"

	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/database"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/middleware/auth"
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

	// リポジトリ初期化
	userRepository := userRepo.NewUserRepository(db)
	redisRepository := redisRepo.NewRedisRepository(redisClient)
	dashboardRepository := dashboardRepo.NewDashboardRepository(db)

	// ユースケース初期化
	authUsecase := usecase.NewAuthUsecase(userRepository, redisRepository, cfg)
	dashboardUsecase := usecase.NewDashboardUsecase(userRepository, cfg)
	dashboardUsecase.SetDashboardRepository(dashboardRepository)

	// ハンドラー初期化
	authHandler := httpHandler.NewAuthHandler(authUsecase)
	dashboardHandler := httpHandler.NewDashboardHandler(dashboardUsecase)

	// ルーター設定
	router := chi.NewRouter()
	setupMiddleware(router, cfg)
	setupRoutes(router, authHandler, dashboardHandler, cfg)

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
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	
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

func setupRoutes(r *chi.Mux, authHandler *httpHandler.AuthHandler, dashboardHandler *httpHandler.DashboardHandler, cfg *config.Config) {
	// JWT認証ミドルウェア
	jwtMiddleware := auth.NewJWTMiddleware(cfg.Auth0Domain)

	// 認証不要のルート
	r.Route("/api/v1", func(r chi.Router) {
		// 認証関連
		r.Post("/auth/sync", authHandler.SyncUser)
		
		// 認証が必要なルート
		r.Group(func(r chi.Router) {
			r.Use(jwtMiddleware.Middleware)
			
			// ダッシュボード
			r.Get("/dashboard", dashboardHandler.GetDashboard)
			r.Get("/dashboard/tasks", dashboardHandler.GetTasks)
			r.Get("/dashboard/stats", dashboardHandler.GetStats)
		})
	})
}