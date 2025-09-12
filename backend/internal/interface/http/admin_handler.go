package http

import (
	"net/http"

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