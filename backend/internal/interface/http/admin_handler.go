package http

import (
    "net/http"
    "encoding/json"
    "strings"

    "github.com/go-chi/chi/v5"
    "github.com/rikut0904/bloomia/backend/internal/domain/entities"
    "github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
    "github.com/rikut0904/bloomia/backend/internal/usecase"
)

type AdminHandler struct {
	*BaseHandler
	adminUsecase *usecase.AdminUsecase
}

func NewAdminHandler(adminUsecase *usecase.AdminUsecase, cfg *config.Config) *AdminHandler {
	return &AdminHandler{
		BaseHandler:  NewBaseHandler(cfg),
		adminUsecase: adminUsecase,
	}
}

func (h *AdminHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	h.HandleWithAuth(w, r, http.MethodGet, func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
		// ページネーションパラメータを取得
		page, perPage := getPaginationParams(r)
		
		// フィルタパラメータを取得
		schoolID := getStringQueryParam(r, "school_id")

		users, err := h.adminUsecase.GetAllUsers(r.Context(), page, perPage, schoolID, authCtx.RequesterRole, authCtx.RequesterSchoolID)
		if err != nil {
			return err
		}

		h.SendJSONResponse(w, users, http.StatusOK)
		return nil
	})
}

func (h *AdminHandler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	h.HandleWithValidation(w, r, http.MethodPut, 
		func(w http.ResponseWriter, r *http.Request) bool {
			var req entities.UpdateUserRoleRequest
			return h.ParseJSONAndValidate(w, r, &req, ValidateUpdateUserRoleRequest)
		},
		func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
			var req entities.UpdateUserRoleRequest
			parseJSONRequest(w, r, &req) // Already validated above

			err := h.adminUsecase.UpdateUserRole(r.Context(), &req, authCtx.RequesterRole, authCtx.RequesterSchoolID)
			if err != nil {
				return err
			}

			h.SendSuccessResponse(w, "User role updated successfully", nil)
			return nil
		},
	)
}

func (h *AdminHandler) UpdateUserStatus(w http.ResponseWriter, r *http.Request) {
	h.HandleWithValidation(w, r, http.MethodPut,
		func(w http.ResponseWriter, r *http.Request) bool {
			var req UpdateUserStatusRequest
			return h.ParseJSONAndValidate(w, r, &req, ValidateUpdateUserStatusRequest)
		},
		func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
			var req UpdateUserStatusRequest
			parseJSONRequest(w, r, &req) // Already validated above

			err := h.adminUsecase.UpdateUserStatus(r.Context(), req.UserID, req.IsActive, req.IsApproved, authCtx.RequesterRole, authCtx.RequesterSchoolID)
			if err != nil {
				return err
			}

			h.SendSuccessResponse(w, "User status updated successfully", nil)
			return nil
		},
	)
}

func (h *AdminHandler) GetAllSchools(w http.ResponseWriter, r *http.Request) {
	h.HandleWithAuth(w, r, http.MethodGet, func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
		schools, err := h.adminUsecase.GetAllSchools(r.Context(), authCtx.RequesterRole)
		if err != nil {
			return err
		}

		h.SendJSONResponse(w, map[string]interface{}{
			"schools": schools,
		}, http.StatusOK)
		return nil
	})
}

func (h *AdminHandler) GetUserStats(w http.ResponseWriter, r *http.Request) {
	h.HandleWithAuth(w, r, http.MethodGet, func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
		// フィルタパラメータを取得
		schoolID := getStringQueryParam(r, "school_id")

		stats, err := h.adminUsecase.GetUserStatsByRole(r.Context(), schoolID, authCtx.RequesterRole, authCtx.RequesterSchoolID)
		if err != nil {
			return err
		}

		h.SendJSONResponse(w, map[string]interface{}{
			"stats": stats,
		}, http.StatusOK)
		return nil
	})
}

// InviteUser ユーザー招待
func (h *AdminHandler) InviteUser(w http.ResponseWriter, r *http.Request) {
	h.HandleWithValidation(w, r, http.MethodPost,
		func(w http.ResponseWriter, r *http.Request) bool {
			var req InviteUserRequest
			return h.ParseJSONAndValidate(w, r, &req, ValidateInviteUserRequest)
		},
		func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
			var req InviteUserRequest
			parseJSONRequest(w, r, &req) // Already validated above

			err := h.adminUsecase.InviteUser(r.Context(), req.Name, req.Email, req.Role, req.SchoolID, req.Message, authCtx.RequesterRole, authCtx.RequesterSchoolID)
			if err != nil {
				return err
			}

			h.SendSuccessResponse(w, "User invitation sent successfully", nil)
			return nil
		},
	)
}

// GetUserByID 管理者用：ユーザー詳細
func (h *AdminHandler) GetUserByID(w http.ResponseWriter, r *http.Request) {
    h.HandleWithAuth(w, r, http.MethodGet, func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
        userID := chi.URLParam(r, "id")
        if userID == "" {
            h.SendErrorResponse(w, "user id required", http.StatusBadRequest)
            return nil
        }

        user, err := h.adminUsecase.GetUserByID(r.Context(), userID, authCtx.RequesterRole, authCtx.RequesterSchoolID)
        if err != nil {
            return err
        }
        h.SendJSONResponse(w, map[string]interface{}{"success": true, "user": user}, http.StatusOK)
        return nil
    })
}

// UpdateUser 管理者用：ユーザー更新
func (h *AdminHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
    h.HandleWithAuth(w, r, http.MethodPut, func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
        var req struct {
            Name     *string `json:"name"`
            Email    *string `json:"email"`
            Role     *string `json:"role"`
            SchoolID *string `json:"school_id"`
        }
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            h.SendErrorResponse(w, "Invalid request body", http.StatusBadRequest)
            return nil
        }
        userID := strings.TrimPrefix(r.URL.Path, "/api/v1/admin/users/")
        if userID == "" {
            h.SendErrorResponse(w, "user id required", http.StatusBadRequest)
            return nil
        }

        update := entities.User{}
        if req.Name != nil { update.DisplayName = *req.Name }
        if req.Email != nil { update.Email = *req.Email }
        if req.Role != nil { update.Role = *req.Role }
        if req.SchoolID != nil { update.SchoolID = *req.SchoolID }

        updated, err := h.adminUsecase.UpdateUser(r.Context(), userID, update, authCtx.RequesterRole, authCtx.RequesterSchoolID)
        if err != nil {
            return err
        }
        h.SendJSONResponse(w, map[string]interface{}{"success": true, "user": updated}, http.StatusOK)
        return nil
    })
}

// AdminCreateSchoolRequest 管理者用 学校作成リクエスト
type AdminCreateSchoolRequest struct {
    Name           string  `json:"name"`
    Type           *string `json:"type,omitempty"`
    Prefecture     *string `json:"prefecture,omitempty"`
    City           *string `json:"city,omitempty"`
    Address        *string `json:"address,omitempty"`
    Phone          *string `json:"phone,omitempty"`
    PrincipalName  *string `json:"principalName,omitempty"`
    StudentCount   *int    `json:"studentCount,omitempty"`
}

// CreateSchool 管理者用に学校を作成（READMEのスキーマに準拠）
func (h *AdminHandler) CreateSchool(w http.ResponseWriter, r *http.Request) {
    h.HandleWithAuth(w, r, http.MethodPost, func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error {
        if authCtx.RequesterRole != "admin" && authCtx.RequesterRole != "school_admin" {
            h.SendErrorResponse(w, "insufficient permissions", http.StatusForbidden)
            return nil
        }

        var req AdminCreateSchoolRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            h.SendErrorResponse(w, "Invalid request body", http.StatusBadRequest)
            return nil
        }
        if req.Name == "" {
            h.SendErrorResponse(w, "name is required", http.StatusBadRequest)
            return nil
        }

        // コード生成（name から slug）
        code := generateCodeFromName(req.Name)
        // 住所はプレーンに連結
        var fullAddress *string
        if req.Address != nil || req.Prefecture != nil || req.City != nil {
            addr := ""
            if req.Prefecture != nil { addr += *req.Prefecture }
            if req.City != nil { addr += *req.City }
            if req.Address != nil { addr += *req.Address }
            if addr != "" { fullAddress = &addr }
        }

        school := &entities.School{
            SchoolID:   code,
            SchoolName: req.Name,
            Address:    fullAddress,
            Phone:      req.Phone,
        }

        created, err := h.adminUsecase.CreateSchool(r.Context(), school)
        if err != nil {
            return err
        }

        h.SendJSONResponse(w, created, http.StatusCreated)
        return nil
    })
}

func generateCodeFromName(name string) string {
    code := ""
    for _, r := range name {
        if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
            code += string(r)
        } else if r >= 'A' && r <= 'Z' {
            code += string(r + 32)
        } else if r == ' ' || r == '　' {
            code += "-"
        }
    }
    if code == "" {
        code = "school"
    }
    return code
}
