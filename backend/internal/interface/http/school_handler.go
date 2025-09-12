package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
	"github.com/rikut0904/bloomia/backend/internal/usecase"
)

type SchoolHandler struct {
	*BaseHandler
	schoolUsecase *usecase.SchoolUsecase
}

func NewSchoolHandler(schoolUsecase *usecase.SchoolUsecase, cfg *config.Config) *SchoolHandler {
	return &SchoolHandler{
		BaseHandler:   NewBaseHandler(cfg),
		schoolUsecase: schoolUsecase,
	}
}

// CreateSchool 学校を作成
func (h *SchoolHandler) CreateSchool(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name                string  `json:"name" validate:"required"`
		Code                string  `json:"code" validate:"required"`
		EmailDomain         *string `json:"email_domain"`
		Address             *string `json:"address"`
		PhoneNumber         *string `json:"phone_number"`
		PrincipalName       *string `json:"principal_name"`
		VicePrincipalName   *string `json:"vice_principal_name"`
		StudentCapacity     int     `json:"student_capacity"`
		ThemeColor          string  `json:"theme_color"`
		BackgroundColor     string  `json:"background_color"`
		AcademicYearStart   int     `json:"academic_year_start"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// バリデーション
	if req.Name == "" || req.Code == "" {
		writeErrorResponse(w, "Name and code are required", http.StatusBadRequest)
		return
	}

	// デフォルト値設定
	if req.ThemeColor == "" {
		req.ThemeColor = "#FF7F50"
	}
	if req.BackgroundColor == "" {
		req.BackgroundColor = "#fdf8f0"
	}
	if req.StudentCapacity == 0 {
		req.StudentCapacity = 500
	}
	if req.AcademicYearStart == 0 {
		req.AcademicYearStart = 4
	}

	school := &entities.School{
		Name:                req.Name,
		Code:                req.Code,
		EmailDomain:         req.EmailDomain,
		Address:             req.Address,
		PhoneNumber:         req.PhoneNumber,
		PrincipalName:       req.PrincipalName,
		VicePrincipalName:   req.VicePrincipalName,
		StudentCapacity:     req.StudentCapacity,
		ThemeColor:          req.ThemeColor,
		BackgroundColor:     req.BackgroundColor,
		AcademicYearStart:   req.AcademicYearStart,
		Settings:            `{"theme": "coral", "background": "#fdf8f0"}`,
		IsActive:            true,
	}

	createdSchool, err := h.schoolUsecase.CreateSchool(r.Context(), school)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"school":  createdSchool,
		"message": "School created successfully",
	})
}

// GetSchool 学校詳細を取得
func (h *SchoolHandler) GetSchool(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		writeErrorResponse(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	school, err := h.schoolUsecase.GetSchoolByID(r.Context(), schoolID)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"school": school,
	})
}

// GetAllSchools 学校一覧を取得
func (h *SchoolHandler) GetAllSchools(w http.ResponseWriter, r *http.Request) {
	// クエリパラメータからフィルタを取得
	filters := make(map[string]interface{})
	
	if search := r.URL.Query().Get("search"); search != "" {
		filters["search"] = search
	}
	
	if isActive := r.URL.Query().Get("is_active"); isActive != "" {
		if active, err := strconv.ParseBool(isActive); err == nil {
			filters["is_active"] = active
		}
	}

	schools, err := h.schoolUsecase.GetAllSchools(r.Context(), filters)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"schools": schools,
		"total":   len(schools),
	})
}

// UpdateSchool 学校情報を更新
func (h *SchoolHandler) UpdateSchool(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		writeErrorResponse(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Name                string  `json:"name"`
		Code                string  `json:"code"`
		EmailDomain         *string `json:"email_domain"`
		Address             *string `json:"address"`
		PhoneNumber         *string `json:"phone_number"`
		PrincipalName       *string `json:"principal_name"`
		VicePrincipalName   *string `json:"vice_principal_name"`
		StudentCapacity     int     `json:"student_capacity"`
		ThemeColor          string  `json:"theme_color"`
		BackgroundColor     string  `json:"background_color"`
		AcademicYearStart   int     `json:"academic_year_start"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// バリデーション
	if req.Name == "" || req.Code == "" {
		writeErrorResponse(w, "Name and code are required", http.StatusBadRequest)
		return
	}

	updateData := entities.School{
		Name:                req.Name,
		Code:                req.Code,
		EmailDomain:         req.EmailDomain,
		Address:             req.Address,
		PhoneNumber:         req.PhoneNumber,
		PrincipalName:       req.PrincipalName,
		VicePrincipalName:   req.VicePrincipalName,
		StudentCapacity:     req.StudentCapacity,
		ThemeColor:          req.ThemeColor,
		BackgroundColor:     req.BackgroundColor,
		AcademicYearStart:   req.AcademicYearStart,
		Settings:            `{"theme": "coral", "background": "#fdf8f0"}`,
	}

	updatedSchool, err := h.schoolUsecase.UpdateSchool(r.Context(), schoolID, updateData)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"school":  updatedSchool,
		"message": "School updated successfully",
	})
}

// DeleteSchool 学校を削除
func (h *SchoolHandler) DeleteSchool(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		writeErrorResponse(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	err = h.schoolUsecase.DeleteSchool(r.Context(), schoolID)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "School deleted successfully",
	})
}

// GetSchoolStats 学校の統計情報を取得
func (h *SchoolHandler) GetSchoolStats(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		writeErrorResponse(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	stats, err := h.schoolUsecase.GetSchoolStats(r.Context(), schoolID)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"stats": stats,
	})
}

// GetSchoolUsers 学校のユーザー一覧を取得
func (h *SchoolHandler) GetSchoolUsers(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		writeErrorResponse(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	role := r.URL.Query().Get("role") // all, student, teacher, admin

	users, err := h.schoolUsecase.GetSchoolUsers(r.Context(), schoolID, role)
	if err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users": users,
		"total": len(users),
	})
}