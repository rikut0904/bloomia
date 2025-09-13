package http

import (
	"encoding/json"
	"net/http"

	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
	"github.com/rikut0904/bloomia/backend/internal/usecase"
)

type AuthHandler struct {
	*BaseHandler
	authUsecase *usecase.AuthUsecase
}

func NewAuthHandler(authUsecase *usecase.AuthUsecase, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		BaseHandler: NewBaseHandler(cfg),
		authUsecase: authUsecase,
	}
}

// CreateInvitation ユーザー招待を作成
func (h *AuthHandler) CreateInvitation(w http.ResponseWriter, r *http.Request) {
	h.HandleWithValidation(w, r, http.MethodPost,
		func(w http.ResponseWriter, r *http.Request) bool {
			var req InviteUserRequest
			return h.ParseJSONAndValidate(w, r, &req, ValidateInviteUserRequest)
		},
		func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
			var req InviteUserRequest
			parseJSONRequest(w, r, &req)

			invitation, err := h.authUsecase.CreateInvitation(
				r.Context(),
				req.Name,
				req.Email,
				req.Role,
				req.SchoolID,
				req.Message,
			)
			if err != nil {
				return err
			}

			h.SendJSONResponse(w, map[string]interface{}{
				"invitation": invitation,
				"message":    "Invitation created successfully",
			}, http.StatusCreated)
			return nil
		},
	)
}

// ValidateInvitation 招待トークンを検証
func (h *AuthHandler) ValidateInvitation(w http.ResponseWriter, r *http.Request) {
	h.HandleWithAuth(w, r, http.MethodGet, func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
		token := r.URL.Query().Get("token")
		if token == "" {
			h.SendErrorResponse(w, "Token is required", http.StatusBadRequest)
			return nil
		}

		invitation, err := h.authUsecase.ValidateInvitation(r.Context(), token)
		if err != nil {
			return err
		}

		h.SendJSONResponse(w, map[string]interface{}{
			"invitation": invitation,
		}, http.StatusOK)
		return nil
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

// VerifyUser Firebase UIDと管理者権限を検証
func (h *AuthHandler) VerifyUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		FirebaseUID string  `json:"firebaseUid"`
		SchoolID    *string `json:"schoolId"`
		AdminOnly   bool    `json:"adminOnly"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.FirebaseUID == "" {
		writeErrorResponse(w, "Firebase UID is required", http.StatusBadRequest)
		return
	}

	// 開発環境では認証をバイパス
	if h.config.DisableAuth {
		dummyUser := map[string]interface{}{
			"uid":        req.FirebaseUID,
			"email":      "admin@example.com",
			"display_name": "Admin User",
			"role":       "admin",
			"school_id":  "school1",
		}
		
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"user":    dummyUser,
			"message": "User verified successfully (development mode)",
		})
		return
	}

	// ユーザー情報を取得
	user, err := h.authUsecase.GetUserByFirebaseUID(r.Context(), req.FirebaseUID)
	if err != nil {
		writeErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	// 管理者権限チェック
	if req.AdminOnly && user.Role != "admin" {
		writeErrorResponse(w, "Admin access required", http.StatusForbidden)
		return
	}

	// 学校IDチェック（一般ユーザーの場合）
	if !req.AdminOnly && req.SchoolID != nil && user.SchoolID != *req.SchoolID {
		writeErrorResponse(w, "School ID mismatch", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"user":    user,
		"message": "User verified successfully",
	})
}

// SyncUser Firebase認証とデータベースの同期
func (h *AuthHandler) SyncUser(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		h.syncUserCreate(w, r)
	case http.MethodGet:
		h.syncUserGet(w, r)
	default:
		writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (h *AuthHandler) syncUserCreate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FirebaseUID string  `json:"firebase_uid"`
		Email       string  `json:"email"`
		DisplayName *string `json:"display_name"`
		SchoolID    *string `json:"school_id"`
		Role        *string `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.FirebaseUID == "" || req.Email == "" {
		writeErrorResponse(w, "Firebase UID and email are required", http.StatusBadRequest)
		return
	}

	user, err := h.authUsecase.SyncUser(
		r.Context(),
		req.FirebaseUID,
		req.Email,
		req.DisplayName,
		req.SchoolID,
		req.Role,
	)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"user":    user,
		"message": "User synchronized successfully",
	})
}

func (h *AuthHandler) syncUserGet(w http.ResponseWriter, r *http.Request) {
	firebaseUID := r.URL.Query().Get("uid")
	if firebaseUID == "" {
		writeErrorResponse(w, "Firebase UID is required", http.StatusBadRequest)
		return
	}

	user, err := h.authUsecase.GetUserByFirebaseUID(r.Context(), firebaseUID)
	if err != nil {
		writeErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": user,
	})
}

