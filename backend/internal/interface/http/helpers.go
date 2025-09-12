package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
)

// AuthContext 認証コンテキスト
type AuthContext struct {
	RequesterRole     string
	RequesterSchoolID string
}

// ErrorResponse エラーレスポンス
type ErrorResponse struct {
	Error     string    `json:"error"`
	Status    int       `json:"status"`
	Timestamp time.Time `json:"timestamp"`
}

// SuccessResponse 成功レスポンス
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// getAuthContext 認証コンテキストを取得
func getAuthContext(cfg *config.Config) AuthContext {
	var requesterRole string
	var requesterSchoolID string
	
	if cfg.DisableAuth {
		// 開発環境：認証を無効化
		requesterRole = cfg.MockUserRole
		requesterSchoolID = cfg.MockUserSchoolID
	} else {
		// 本番環境：実際の認証を実装
		// TODO: JWTからroleとschool_idを取得
		requesterRole = "admin"
		requesterSchoolID = "1"
	}

	return AuthContext{
		RequesterRole:     requesterRole,
		RequesterSchoolID: requesterSchoolID,
	}
}

// writeErrorResponse エラーレスポンスを書き込み
func writeErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	
	response := ErrorResponse{
		Error:     message,
		Status:    statusCode,
		Timestamp: time.Now(),
	}
	
	json.NewEncoder(w).Encode(response)
}

// writeSuccessResponse 成功レスポンスを書き込み
func writeSuccessResponse(w http.ResponseWriter, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	
	response := SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
	
	json.NewEncoder(w).Encode(response)
}

// writeJSONResponse JSONレスポンスを書き込み
func writeJSONResponse(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// getPaginationParams ページネーションパラメータを取得
func getPaginationParams(r *http.Request) (page, perPage int) {
	page, _ = strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}

	perPage, _ = strconv.Atoi(r.URL.Query().Get("per_page"))
	if perPage <= 0 || perPage > 100 {
		perPage = 20
	}

	return page, perPage
}

// getStringQueryParam 文字列クエリパラメータを取得
func getStringQueryParam(r *http.Request, key string) *string {
	value := r.URL.Query().Get(key)
	if value == "" {
		return nil
	}
	return &value
}

// validateMethod HTTPメソッドを検証
func validateMethod(w http.ResponseWriter, r *http.Request, allowedMethod string) bool {
	if r.Method != allowedMethod {
		writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return false
	}
	return true
}

// parseJSONRequest JSONリクエストを解析
func parseJSONRequest(w http.ResponseWriter, r *http.Request, dest interface{}) bool {
	if err := json.NewDecoder(r.Body).Decode(dest); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return false
	}
	return true
}

// convertSchoolIDToInt64 学校IDを文字列からint64に変換
func convertSchoolIDToInt64(schoolID string) (int64, error) {
	if schoolID == "" {
		return 0, fmt.Errorf("school ID is empty")
	}
	return strconv.ParseInt(schoolID, 10, 64)
}