package usecase

import (
	"context"
	"fmt"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
)

type AdminUsecase struct {
	adminRepo repositories.AdminRepository
	userRepo  repositories.UserRepository
	config    *config.Config
}

func NewAdminUsecase(adminRepo repositories.AdminRepository, userRepo repositories.UserRepository, cfg *config.Config) *AdminUsecase {
	return &AdminUsecase{
		adminRepo: adminRepo,
		userRepo:  userRepo,
		config:    cfg,
	}
}

func (u *AdminUsecase) GetAllUsers(ctx context.Context, page, perPage int, schoolID *string, requesterRole string, requesterSchoolID string) (*entities.UserListResponse, error) {
	// 権限チェック
	if !u.canManageUsers(requesterRole, schoolID, requesterSchoolID) {
		return nil, fmt.Errorf("insufficient permissions to manage users")
	}

	// school_adminの場合は自分の学校のユーザーのみ
	if requesterRole == "school_admin" {
		schoolID = &requesterSchoolID
	}

	users, totalCount, err := u.adminRepo.GetAllUsers(ctx, page, perPage, schoolID)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	return &entities.UserListResponse{
		Users:      users,
		TotalCount: totalCount,
		Page:       page,
		PerPage:    perPage,
	}, nil
}

func (u *AdminUsecase) UpdateUserRole(ctx context.Context, req *entities.UpdateUserRoleRequest, requesterRole string, requesterSchoolID string) error {
	// 権限チェック
	if !u.canManageUsers(requesterRole, req.SchoolID, requesterSchoolID) {
		return fmt.Errorf("insufficient permissions to update user role")
	}

	// 対象ユーザーを取得
	targetUser, err := u.adminRepo.GetUserByID(ctx, req.UserID)
	if err != nil {
		return fmt.Errorf("failed to get target user: %w", err)
	}

	// school_adminは自分の学校のユーザーのみ変更可能
	if requesterRole == "school_admin" && (targetUser.SchoolID == nil || *targetUser.SchoolID != requesterSchoolID) {
		return fmt.Errorf("cannot modify users from other schools")
	}

	// adminロールは管理者のみが設定可能
	if req.Role == "admin" && requesterRole != "admin" {
		return fmt.Errorf("only system administrators can assign admin role")
	}

	// school_adminロールの制限
	if req.Role == "school_admin" && requesterRole == "school_admin" {
		return fmt.Errorf("school administrators cannot assign school_admin role")
	}

	// 学校IDの設定
	schoolIDToSet := req.SchoolID
	if requesterRole == "school_admin" {
		// school_adminの場合は自分の学校に固定
		schoolIDToSet = &requesterSchoolID
	}

	return u.adminRepo.UpdateUserRole(ctx, req.UserID, req.Role, schoolIDToSet)
}

func (u *AdminUsecase) UpdateUserStatus(ctx context.Context, userID string, isActive, isApproved bool, requesterRole string, requesterSchoolID string) error {
	// 対象ユーザーを取得
	targetUser, err := u.adminRepo.GetUserByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get target user: %w", err)
	}

	// school_adminは自分の学校のユーザーのみ変更可能
	if requesterRole == "school_admin" && (targetUser.SchoolID == nil || *targetUser.SchoolID != requesterSchoolID) {
		return fmt.Errorf("cannot modify users from other schools")
	}

	// adminユーザーはschool_adminが無効化できない
	if targetUser.Role == "admin" && requesterRole != "admin" {
		return fmt.Errorf("only system administrators can modify admin users")
	}

	return u.adminRepo.UpdateUserStatus(ctx, userID, isActive, isApproved)
}

func (u *AdminUsecase) GetAllSchools(ctx context.Context, requesterRole string) ([]entities.SchoolOption, error) {
	// 管理者権限が必要
	if requesterRole != "admin" && requesterRole != "school_admin" {
		return nil, fmt.Errorf("insufficient permissions to view schools")
	}

	return u.adminRepo.GetAllSchools(ctx)
}

func (u *AdminUsecase) GetUserStatsByRole(ctx context.Context, schoolID *string, requesterRole string, requesterSchoolID string) (map[string]int, error) {
	// school_adminの場合は自分の学校の統計のみ
	if requesterRole == "school_admin" {
		schoolID = &requesterSchoolID
	} else if requesterRole != "admin" {
		return nil, fmt.Errorf("insufficient permissions to view user statistics")
	}

	return u.adminRepo.GetUserStatsByRole(ctx, schoolID)
}

// 権限チェックヘルパー
func (u *AdminUsecase) canManageUsers(requesterRole string, targetSchoolID *string, requesterSchoolID string) bool {
	switch requesterRole {
	case "admin":
		return true // adminは全てのユーザーを管理可能
	case "school_admin":
		// school_adminは自分の学校のユーザーのみ管理可能
		return targetSchoolID == nil || *targetSchoolID == requesterSchoolID
	default:
		return false
	}
}

// InviteUser ユーザー招待
func (u *AdminUsecase) InviteUser(ctx context.Context, name, email, role string, schoolID string, message, requesterRole string, requesterSchoolID string) error {
	// 権限チェック
	if !u.canManageUsers(requesterRole, &schoolID, requesterSchoolID) {
		return fmt.Errorf("insufficient permissions to invite users")
	}

	// 役割のバリデーション
	validRoles := []string{"school_admin", "teacher", "student"}
	validRole := false
	for _, validRoleName := range validRoles {
		if role == validRoleName {
			validRole = true
			break
		}
	}
	if !validRole {
		return fmt.Errorf("invalid role: %s", role)
	}

	// 招待処理（実際の実装ではメール送信など）
	// ここでは仮想的に招待レコードを作成
	invitation := entities.UserInvitation{
		Name:     name,
		Email:    email,
		Role:     role,
		SchoolID: schoolID,
		Message:  message,
		Status:   "pending",
	}

	// TODO: 実際の招待処理を実装
	// - 招待レコードをDBに保存
	// - 招待メールを送信
	// - 招待リンクを生成

	_ = invitation // 仮の使用

	return nil
}