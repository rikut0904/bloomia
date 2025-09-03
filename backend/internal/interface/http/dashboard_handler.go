package http

import (
	"encoding/json"
	"net/http"

	"github.com/rikut0904/bloomia/backend/internal/infrastructure/middleware/auth"
	"github.com/rikut0904/bloomia/backend/internal/usecase"
)

type DashboardHandler struct {
	dashboardUsecase *usecase.DashboardUsecase
}

func NewDashboardHandler(dashboardUsecase *usecase.DashboardUsecase) *DashboardHandler {
	return &DashboardHandler{
		dashboardUsecase: dashboardUsecase,
	}
}

func (h *DashboardHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// JWT認証から ユーザー情報を取得
	user, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// ロールをクエリパラメータから取得（フォールバックとして）
	role := r.URL.Query().Get("role")
	if role == "" {
		role = "student" // デフォルト
	}

	// ダッシュボードデータを取得
	dashboardData, err := h.dashboardUsecase.GetDashboardData(r.Context(), user.Sub, role)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// レスポンス
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dashboardData)
}

func (h *DashboardHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	user, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	role := r.URL.Query().Get("role")
	dashboardData, err := h.dashboardUsecase.GetDashboardData(r.Context(), user.Sub, role)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"tasks": dashboardData.Tasks,
	})
}

func (h *DashboardHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	user, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	role := r.URL.Query().Get("role")
	dashboardData, err := h.dashboardUsecase.GetDashboardData(r.Context(), user.Sub, role)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"stats": dashboardData.Stats,
	})
}