package http

import (
	"encoding/json"
	"net/http"
	"time"

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

// CreateInvitation ユーザー招待を作成
func (h *AuthHandler) CreateInvitation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Role     string `json:"role"`
		SchoolID int64  `json:"school_id"`
		Message  string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// バリデーション
	if req.Name == "" || req.Email == "" || req.Role == "" || req.SchoolID == 0 {
		writeErrorResponse(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// 招待作成
	invitation, err := h.authUsecase.CreateInvitation(
		r.Context(),
		req.Name,
		req.Email,
		req.Role,
		req.SchoolID,
		req.Message,
	)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"invitation": invitation,
		"message":    "Invitation created successfully",
	})
}

// ValidateInvitation 招待トークンを検証
func (h *AuthHandler) ValidateInvitation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := r.URL.Query().Get("token")
	if token == "" {
		writeErrorResponse(w, "Token is required", http.StatusBadRequest)
		return
	}

	invitation, err := h.authUsecase.ValidateInvitation(r.Context(), token)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"invitation": invitation,
	})
}

// RegisterUser 招待に基づいてユーザー登録
func (h *AuthHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Token    string `json:"token"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// バリデーション
	if req.Token == "" || req.Name == "" || req.Email == "" || req.Password == "" {
		writeErrorResponse(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// ユーザー登録
	user, err := h.authUsecase.RegisterUser(
		r.Context(),
		req.Token,
		req.Name,
		req.Email,
		req.Password,
	)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":    user,
		"message": "User registered successfully",
	})
}

// LoginUser ユーザーログイン
func (h *AuthHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// バリデーション
	if req.Email == "" || req.Password == "" {
		writeErrorResponse(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	// ログイン
	user, err := h.authUsecase.LoginUser(r.Context(), req.Email, req.Password)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// JWTトークンを生成（簡略化）
	token := "jwt_token_here" // 実際のJWT実装が必要

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

func writeErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error":   message,
		"status":  statusCode,
		"timestamp": time.Now(),
	})
}