package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/middleware"
	"github.com/rikut0904/bloomia/backend/internal/usecase"
)

type AdminHandler struct {
	adminUsecase *usecase.AdminUsecase
}

func NewAdminHandler(adminUsecase *usecase.AdminUsecase) *AdminHandler {
	return &AdminHandler{
		adminUsecase: adminUsecase,
	}
}

func (h *AdminHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Firebase認証からユーザー情報を取得
	_, ok := middleware.GetFirebaseUserFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// 現在のユーザー情報を取得して権限チェック
	// TODO: 実際の実装では、JWTからroleとschool_idを取得するか、DBから取得する
	// ここではモックとしてadminロールを仮定
	requesterRole := "admin"       // 実際はJWTやDBから取得
	requesterSchoolID := int64(1)  // 実際はJWTやDBから取得

	// クエリパラメータを取得
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}

	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if perPage <= 0 || perPage > 100 {
		perPage = 20
	}

	var schoolID *int64
	if schoolIDStr := r.URL.Query().Get("school_id"); schoolIDStr != "" {
		if id, err := strconv.ParseInt(schoolIDStr, 10, 64); err == nil {
			schoolID = &id
		}
	}

	users, err := h.adminUsecase.GetAllUsers(r.Context(), page, perPage, schoolID, requesterRole, requesterSchoolID)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(users)
}

func (h *AdminHandler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Firebase認証からユーザー情報を取得
	_, ok := middleware.GetFirebaseUserFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// リクエストボディを解析
	var req entities.UpdateUserRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// バリデーション
	if req.UserID <= 0 {
		writeErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	validRoles := map[string]bool{
		"admin":        true,
		"school_admin": true,
		"teacher":      true,
		"student":      true,
	}
	if !validRoles[req.Role] {
		writeErrorResponse(w, "Invalid role", http.StatusBadRequest)
		return
	}

	// 現在のユーザー情報を取得して権限チェック
	requesterRole := "admin"       // 実際はJWTやDBから取得
	requesterSchoolID := int64(1)  // 実際はJWTやDBから取得

	err := h.adminUsecase.UpdateUserRole(r.Context(), &req, requesterRole, requesterSchoolID)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "User role updated successfully",
	})
}

func (h *AdminHandler) UpdateUserStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Firebase認証からユーザー情報を取得
	_, ok := middleware.GetFirebaseUserFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	type UpdateUserStatusRequest struct {
		UserID     int64 `json:"user_id"`
		IsActive   bool  `json:"is_active"`
		IsApproved bool  `json:"is_approved"`
	}

	var req UpdateUserStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.UserID <= 0 {
		writeErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// 現在のユーザー情報を取得して権限チェック
	requesterRole := "admin"       // 実際はJWTやDBから取得
	requesterSchoolID := int64(1)  // 実際はJWTやDBから取得

	err := h.adminUsecase.UpdateUserStatus(r.Context(), req.UserID, req.IsActive, req.IsApproved, requesterRole, requesterSchoolID)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "User status updated successfully",
	})
}

func (h *AdminHandler) GetAllSchools(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Firebase認証からユーザー情報を取得
	_, ok := middleware.GetFirebaseUserFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	requesterRole := "admin" // 実際はJWTやDBから取得

	schools, err := h.adminUsecase.GetAllSchools(r.Context(), requesterRole)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"schools": schools,
	})
}

func (h *AdminHandler) GetUserStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Firebase認証からユーザー情報を取得
	_, ok := middleware.GetFirebaseUserFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	var schoolID *int64
	if schoolIDStr := r.URL.Query().Get("school_id"); schoolIDStr != "" {
		if id, err := strconv.ParseInt(schoolIDStr, 10, 64); err == nil {
			schoolID = &id
		}
	}

	requesterRole := "admin"       // 実際はJWTやDBから取得
	requesterSchoolID := int64(1)  // 実際はJWTやDBから取得

	stats, err := h.adminUsecase.GetUserStatsByRole(r.Context(), schoolID, requesterRole, requesterSchoolID)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"stats": stats,
	})
}

// InviteUser ユーザー招待
func (h *AdminHandler) InviteUser(w http.ResponseWriter, r *http.Request) {
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

	// 権限チェック
	requesterRole := "admin"       // 実際はJWTやDBから取得
	requesterSchoolID := int64(1)  // 実際はJWTやDBから取得

	err := h.adminUsecase.InviteUser(r.Context(), req.Name, req.Email, req.Role, req.SchoolID, req.Message, requesterRole, requesterSchoolID)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User invitation sent successfully",
	})
}