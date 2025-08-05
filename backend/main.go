package main

import (
	"log"
	"net/http"
	"os"

	"bloomia-backend/platform/router"

	"github.com/joho/godotenv"
)

func main() {
	// 環境変数の読み込み
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// ルーターの設定
	r := router.SetupRouter()

	// ポートの設定
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}