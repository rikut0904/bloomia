package http

import (
	"net/http"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
)

// UserRoleRequestValidator ユーザー役割更新リクエストのバリデーション
func ValidateUpdateUserRoleRequest(w http.ResponseWriter, data interface{}) bool {
	req, ok := data.(*entities.UpdateUserRoleRequest)
	if !ok {
		writeErrorResponse(w, "Invalid request type", http.StatusBadRequest)
		return false
	}

	validator := NewValidationContext(w)
	validator.RequiredString(req.UserID, "User ID").ValidRole(req.Role)
	
	return validator.IsValid()
}

// UserStatusRequestValidator ユーザーステータス更新リクエストのバリデーション
func ValidateUpdateUserStatusRequest(w http.ResponseWriter, data interface{}) bool {
	req, ok := data.(*UpdateUserStatusRequest)
	if !ok {
		writeErrorResponse(w, "Invalid request type", http.StatusBadRequest)
		return false
	}

	if req.UserID == "" {
		writeErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return false
	}

	return true
}

// InviteUserRequestValidator ユーザー招待リクエストのバリデーション
func ValidateInviteUserRequest(w http.ResponseWriter, data interface{}) bool {
	req, ok := data.(*InviteUserRequest)
	if !ok {
		writeErrorResponse(w, "Invalid request type", http.StatusBadRequest)
		return false
	}

	validator := NewValidationContext(w)
	validator.RequiredString(req.Name, "Name").
		RequiredString(req.Email, "Email").
		RequiredString(req.Role, "Role").
		RequiredString(req.SchoolID, "School ID").
		ValidRole(req.Role).
		ValidEmail(req.Email)
	
	return validator.IsValid()
}

// InviteUserRequest 招待リクエスト用構造体
type InviteUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	SchoolID string `json:"school_id"`
	Message  string `json:"message"`
}

// UpdateUserStatusRequest ユーザーステータス更新用構造体
type UpdateUserStatusRequest struct {
	UserID     string `json:"user_id"`
	IsActive   bool   `json:"is_active"`
	IsApproved bool   `json:"is_approved"`
}