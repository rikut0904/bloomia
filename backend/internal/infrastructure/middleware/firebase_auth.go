package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/rikut0904/bloomia/backend/internal/infrastructure/firebase"
)

type FirebaseUser struct {
	UID         string
	Email       string
	DisplayName string
	Role        string
	SchoolID    int64
}

type contextKey string

const FirebaseUserKey contextKey = "firebase_user"

// FirebaseAuthMiddleware Firebase認証ミドルウェア
func FirebaseAuthMiddleware(firebaseClient *firebase.FirebaseClient) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Authorizationヘッダーからトークンを取得
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// Bearer トークンの形式をチェック
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			idToken := tokenParts[1]

			// Firebase IDトークンを検証
			token, err := firebaseClient.VerifyIDToken(r.Context(), idToken)
			if err != nil {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			// カスタムクレームからユーザー情報を取得
			claims := token.Claims
			role, _ := claims["role"].(string)
			schoolID, _ := claims["school_id"].(float64)

			// ユーザー情報をコンテキストに追加
			firebaseUser := &FirebaseUser{
				UID:         token.UID,
				Email:       token.Claims["email"].(string),
				DisplayName: token.Claims["name"].(string),
				Role:        role,
				SchoolID:    int64(schoolID),
			}

			ctx := context.WithValue(r.Context(), FirebaseUserKey, firebaseUser)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetFirebaseUserFromContext コンテキストからFirebaseユーザー情報を取得
func GetFirebaseUserFromContext(ctx context.Context) (*FirebaseUser, bool) {
	user, ok := ctx.Value(FirebaseUserKey).(*FirebaseUser)
	return user, ok
}

// RequireRole 特定の役割を要求するミドルウェア
func RequireRole(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, ok := GetFirebaseUserFromContext(r.Context())
			if !ok {
				http.Error(w, "User not authenticated", http.StatusUnauthorized)
				return
			}

			if user.Role != requiredRole {
				http.Error(w, "Insufficient permissions", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireAnyRole 複数の役割のいずれかを要求するミドルウェア
func RequireAnyRole(requiredRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, ok := GetFirebaseUserFromContext(r.Context())
			if !ok {
				http.Error(w, "User not authenticated", http.StatusUnauthorized)
				return
			}

			hasRole := false
			for _, role := range requiredRoles {
				if user.Role == role {
					hasRole = true
					break
				}
			}

			if !hasRole {
				http.Error(w, "Insufficient permissions", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}