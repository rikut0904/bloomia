package http

import (
	"encoding/json"
	"net/http"

	"github.com/rikut0904/bloomia/backend/internal/infrastructure/middleware/auth"
	"github.com/rikut0904/bloomia/backend/internal/usecase"
)

type AuthHandler struct {
	authUsecase *usecase.AuthUsecase
}

func NewAuthHandler(authUsecase *usecase.AuthUsecase) *AuthHandler {
	return &AuthHandler{
		authUsecase: authUsecase,
	}
}

func (h *AuthHandler) SyncUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// リクエストボディからユーザー情報を取得
	var req usecase.SyncUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// JWTトークンからユーザー情報を取得する場合のフォールバック
		user, ok := auth.GetUserFromContext(r.Context())
		if !ok {
			writeErrorResponse(w, "Invalid request body and no authenticated user", http.StatusBadRequest)
			return
		}
		
		req = usecase.SyncUserRequest{
			Sub:     user.Sub,
			Name:    user.Name,
			Email:   user.Email,
			Picture: "", // JWTには画像情報がない場合がある
		}
	}

	// ユーザー同期を実行
	result, err := h.authUsecase.SyncUser(r.Context(), &req)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// レスポンス
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"user":        result.User,
		"school":      result.School,
		"is_new_user": result.IsNewUser,
	})
}

func writeErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error":   true,
		"message": message,
	})
}