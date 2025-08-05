package router

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"bloomia-backend/platform/authenticator"
	"bloomia-backend/platform/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	// CORS設定
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// セッション設定
	store := cookie.NewStore([]byte(os.Getenv("SESSION_SECRET")))
	router.Use(sessions.Sessions("auth-session", store))

	// 静的ファイルの提供
	router.Static("/static", "./web/static")
	router.LoadHTMLGlob("web/template/*")

	// 認証機能の初期化
	auth, err := authenticator.NewAuthenticator()
	if err != nil {
		log.Fatal(err)
	}

	// ルート
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "home.html", gin.H{
			"title": "Bloomia - Home",
		})
	})

	// ログイン
	router.GET("/login", func(c *gin.Context) {
		state := "some-random-state-key"
		url := auth.AuthCodeURL(state)
		c.Redirect(http.StatusTemporaryRedirect, url)
	})

	// コールバック
	router.GET("/callback", func(c *gin.Context) {
		code := c.Query("code")
		state := c.Query("state")

		if state != "some-random-state-key" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state"})
			return
		}

		token, err := auth.Exchange(context.Background(), code)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
			return
		}

		userProfile, err := auth.GetUserProfile(context.Background(), token)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user profile"})
			return
		}

		// セッションにユーザー情報を保存
		session := sessions.Default(c)
		session.Set("user", userProfile)
		session.Save()

		c.Redirect(http.StatusTemporaryRedirect, "/user")
	})

	// ユーザーページ（認証が必要）
	router.GET("/user", func(c *gin.Context) {
		// セッションからユーザー情報を取得
		session := sessions.Default(c)
		user := session.Get("user")
		
		if user == nil {
			c.Redirect(http.StatusTemporaryRedirect, "/login")
			return
		}
		
		c.HTML(http.StatusOK, "user.html", gin.H{
			"title": "User Profile",
			"user":  user,
		})
	})

	// ログアウト
	router.GET("/logout", func(c *gin.Context) {
		session := sessions.Default(c)
		session.Clear()
		session.Save()

		logoutURL := fmt.Sprintf("https://%s/v2/logout?client_id=%s&returnTo=%s",
			os.Getenv("AUTH0_DOMAIN"),
			os.Getenv("AUTH0_CLIENT_ID"),
			os.Getenv("AUTH0_LOGOUT_URL"))

		c.Redirect(http.StatusTemporaryRedirect, logoutURL)
	})

	// API エンドポイント（認証が必要）
	api := router.Group("/api")
	api.Use(func(c *gin.Context) {
		// セッションからユーザー情報を取得
		session := sessions.Default(c)
		user := session.Get("user")
		
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		
		c.Next()
	})
	{
		api.GET("/profile", func(c *gin.Context) {
			session := sessions.Default(c)
			user := session.Get("user")
			c.JSON(http.StatusOK, user)
		})
	}

	return router
} 