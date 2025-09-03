package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port              string
	Environment       string
	DatabaseURL       string
	RedisURL          string
	EncryptionKey     string
	JWTSecret         string
	SessionSecret     string
	Auth0Domain       string
	Auth0ClientID     string
	Auth0ClientSecret string
	FrontendURL       string
	WebSocketURL      string
	StoragePath       string
	ThemeColor        string
	BackgroundColor   string
	EnableWhiteboard  bool
	EnableNotes       bool
	EnableGameify     bool
	CoralThemeOnly    bool
}

func Load() *Config {
	// 開発環境では.envファイルを読み込み
	if os.Getenv("APP_ENV") != "production" {
		godotenv.Load()
	}

	return &Config{
		Port:              getEnv("PORT", "8080"),
		Environment:       getEnv("APP_ENV", "development"),
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		RedisURL:          getEnv("REDIS_URL", ""),
		EncryptionKey:     getEnv("ENCRYPTION_KEY", ""),
		JWTSecret:         getEnv("JWT_SECRET", ""),
		SessionSecret:     getEnv("SESSION_SECRET", ""),
		Auth0Domain:       getEnv("AUTH0_DOMAIN", ""),
		Auth0ClientID:     getEnv("AUTH0_CLIENT_ID", ""),
		Auth0ClientSecret: getEnv("AUTH0_CLIENT_SECRET", ""),
		FrontendURL:       getEnv("FRONTEND_URL", "http://localhost:3000"),
		WebSocketURL:      getEnv("WEBSOCKET_URL", "ws://localhost:8080"),
		StoragePath:       getEnv("RAILWAY_STORAGE_PATH", "./storage"),
		ThemeColor:        getEnv("DEFAULT_THEME_COLOR", "#FF7F50"),
		BackgroundColor:   getEnv("DEFAULT_BACKGROUND_COLOR", "#fdf8f0"),
		EnableWhiteboard:  getBoolEnv("ENABLE_WHITEBOARD", true),
		EnableNotes:       getBoolEnv("ENABLE_NOTES", true),
		EnableGameify:     getBoolEnv("ENABLE_GAMIFICATION", true),
		CoralThemeOnly:    getBoolEnv("CORAL_THEME_ONLY", true),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getBoolEnv(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}