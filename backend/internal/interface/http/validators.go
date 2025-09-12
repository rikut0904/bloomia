package http

import (
	"fmt"
	"net/http"
	"strings"
)

// ValidUserRoles 有効なユーザー役割
var ValidUserRoles = map[string]bool{
	"admin":        true,
	"school_admin": true,
	"teacher":      true,
	"student":      true,
}

// validateUserRole ユーザー役割を検証
func validateUserRole(w http.ResponseWriter, role string) bool {
	if !ValidUserRoles[role] {
		writeErrorResponse(w, fmt.Sprintf("Invalid role: %s", role), http.StatusBadRequest)
		return false
	}
	return true
}

// validateRequiredString 必須文字列フィールドを検証
func validateRequiredString(w http.ResponseWriter, value, fieldName string) bool {
	if strings.TrimSpace(value) == "" {
		writeErrorResponse(w, fmt.Sprintf("%s is required", fieldName), http.StatusBadRequest)
		return false
	}
	return true
}

// validateEmail メールアドレスを検証（簡単な検証）
func validateEmail(w http.ResponseWriter, email string) bool {
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		writeErrorResponse(w, "Invalid email format", http.StatusBadRequest)
		return false
	}
	return true
}

// ValidationContext 検証コンテキスト
type ValidationContext struct {
	writer     http.ResponseWriter
	hasErrors  bool
}

// NewValidationContext 新しい検証コンテキストを作成
func NewValidationContext(w http.ResponseWriter) *ValidationContext {
	return &ValidationContext{
		writer:    w,
		hasErrors: false,
	}
}

// RequiredString 必須文字列フィールドを検証
func (v *ValidationContext) RequiredString(value, fieldName string) *ValidationContext {
	if v.hasErrors {
		return v
	}
	
	if strings.TrimSpace(value) == "" {
		writeErrorResponse(v.writer, fmt.Sprintf("%s is required", fieldName), http.StatusBadRequest)
		v.hasErrors = true
	}
	return v
}

// ValidRole 有効な役割を検証
func (v *ValidationContext) ValidRole(role string) *ValidationContext {
	if v.hasErrors {
		return v
	}
	
	if !ValidUserRoles[role] {
		writeErrorResponse(v.writer, fmt.Sprintf("Invalid role: %s", role), http.StatusBadRequest)
		v.hasErrors = true
	}
	return v
}

// ValidEmail メールアドレスを検証
func (v *ValidationContext) ValidEmail(email string) *ValidationContext {
	if v.hasErrors {
		return v
	}
	
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		writeErrorResponse(v.writer, "Invalid email format", http.StatusBadRequest)
		v.hasErrors = true
	}
	return v
}

// IsValid 検証が成功したかどうかを返す
func (v *ValidationContext) IsValid() bool {
	return !v.hasErrors
}