package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/usecase"
)

type SchoolHandler struct {
	schoolUsecase *usecase.SchoolUsecase
}

func NewSchoolHandler(schoolUsecase *usecase.SchoolUsecase) *SchoolHandler {
	return &SchoolHandler{
		schoolUsecase: schoolUsecase,
	}
}

type CreateSchoolRequest struct {
	SchoolID    string  `json:"school_id"`
	SchoolName  string  `json:"school_name"`
	Prefecture  *string `json:"prefecture,omitempty"`
	City        *string `json:"city,omitempty"`
	Address     *string `json:"address,omitempty"`
	Phone       *string `json:"phone,omitempty"`
	Email       *string `json:"email,omitempty"`
}

func (h *SchoolHandler) CreateSchool(w http.ResponseWriter, r *http.Request) {
	var req CreateSchoolRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Basic validation
	if req.SchoolID == "" || req.SchoolName == "" {
		http.Error(w, "School ID and name are required", http.StatusBadRequest)
		return
	}

	school := &entities.School{
		SchoolID:    req.SchoolID,
		SchoolName:  req.SchoolName,
		Prefecture:  req.Prefecture,
		City:        req.City,
		Address:     req.Address,
		Phone:       req.Phone,
		Email:       req.Email,
	}

	createdSchool, err := h.schoolUsecase.CreateSchool(r.Context(), school)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createdSchool)
}

func (h *SchoolHandler) GetSchools(w http.ResponseWriter, r *http.Request) {
	// TODO: Parse filters from query parameters
	filters := make(map[string]interface{})

	schools, err := h.schoolUsecase.GetAllSchools(r.Context(), filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(schools)
}

func (h *SchoolHandler) GetSchoolByID(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	school, err := h.schoolUsecase.GetSchoolByID(r.Context(), schoolID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(school)
}

func (h *SchoolHandler) UpdateSchool(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	var req CreateSchoolRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	updateData := entities.School{
		SchoolID:    req.SchoolID,
		SchoolName:  req.SchoolName,
		Prefecture:  req.Prefecture,
		City:        req.City,
		Address:     req.Address,
		Phone:       req.Phone,
		Email:       req.Email,
	}

	updatedSchool, err := h.schoolUsecase.UpdateSchool(r.Context(), schoolID, updateData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedSchool)
}

func (h *SchoolHandler) DeleteSchool(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	err = h.schoolUsecase.DeleteSchool(r.Context(), schoolID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *SchoolHandler) GetSchoolStats(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	stats, err := h.schoolUsecase.GetSchoolStats(r.Context(), schoolID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (h *SchoolHandler) GetSchoolUsers(w http.ResponseWriter, r *http.Request) {
	schoolIDStr := chi.URLParam(r, "id")
	schoolID, err := strconv.ParseInt(schoolIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid school ID", http.StatusBadRequest)
		return
	}

	role := r.URL.Query().Get("role")

	users, err := h.schoolUsecase.GetSchoolUsers(r.Context(), schoolID, role)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}