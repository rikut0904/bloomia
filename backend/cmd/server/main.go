package main

import (
	"log"
	"os"

	"github.com/rikut0904/bloomia/backend/internal/app"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
)

func main() {
	// 環境変数からポートを取得（デフォルトは8080）
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 設定を読み込み
	cfg := config.Load()

	// アプリケーションを起動
	app, err := app.NewApp(cfg)
	if err != nil {
		log.Fatal("Failed to initialize application:", err)
	}

	log.Printf("Server starting on port %s", port)
	if err := app.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}