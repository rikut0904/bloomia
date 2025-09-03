package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
)

type AuthUsecase struct {
	userRepo  repositories.UserRepository
	redisRepo repositories.RedisRepository
	config    *config.Config
}

func NewAuthUsecase(userRepo repositories.UserRepository, redisRepo repositories.RedisRepository, cfg *config.Config) *AuthUsecase {
	return &AuthUsecase{
		userRepo:  userRepo,
		redisRepo: redisRepo,
		config:    cfg,
	}
}

type SyncUserRequest struct {
	Sub     string `json:"sub"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

type SyncUserResponse struct {
	User    *entities.User   `json:"user"`
	School  *entities.School `json:"school"`
	IsNewUser bool         `json:"is_new_user"`
}

func (u *AuthUsecase) SyncUser(ctx context.Context, req *SyncUserRequest) (*SyncUserResponse, error) {
	// 既存ユーザーを検索
	existingUser, err := u.userRepo.FindByUID(ctx, req.Sub)
	if err != nil && !strings.Contains(err.Error(), "not found") {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	var user *entities.User
	var school *entities.School
	isNewUser := false

	if existingUser != nil {
		// 既存ユーザーの情報を更新
		user = existingUser
		if req.Name != "" {
			user.Name = req.Name
		}
		if req.Picture != "" {
			user.AvatarURL = &req.Picture
		}

		// 最後のログイン時間を更新
		err = u.userRepo.UpdateLastLogin(ctx, req.Sub)
		if err != nil {
			return nil, fmt.Errorf("failed to update last login: %w", err)
		}

		// 基本情報を更新
		err = u.userRepo.Update(ctx, user)
		if err != nil {
			return nil, fmt.Errorf("failed to update user: %w", err)
		}
	} else {
		// 新しいユーザーを作成
		isNewUser = true
		
		// メールドメインから学校を特定
		schoolID := int64(1) // デフォルト学校
		if req.Email != "" {
			emailParts := strings.Split(req.Email, "@")
			if len(emailParts) == 2 {
				domain := emailParts[1]
				foundSchool, err := u.userRepo.FindSchoolByEmailDomain(ctx, domain)
				if err == nil {
					schoolID = foundSchool.ID
				}
			}
		}

		// デフォルトのUI設定
		uiPreferences := map[string]interface{}{
			"theme":      "coral",
			"background": u.config.BackgroundColor,
		}
		uiPreferencesJSON, _ := json.Marshal(uiPreferences)

		user = &entities.User{
			UID:           req.Sub,
			Name:          req.Name,
			Email:         req.Email,
			AvatarURL:     &req.Picture,
			Role:          "student", // デフォルト
			SchoolID:      schoolID,
			IsActive:      true,
			IsApproved:    false, // 管理者による承認が必要
			UIPreferences: string(uiPreferencesJSON),
		}

		err = u.userRepo.Create(ctx, user)
		if err != nil {
			return nil, fmt.Errorf("failed to create user: %w", err)
		}
	}

	// 学校情報を取得
	school, err = u.userRepo.FindSchoolByID(ctx, user.SchoolID)
	if err != nil {
		return nil, fmt.Errorf("failed to find school: %w", err)
	}

	// セッションキャッシュ（30分）
	sessionKey := fmt.Sprintf("session:%s", req.Sub)
	sessionData := map[string]interface{}{
		"user_id":   user.ID,
		"school_id": user.SchoolID,
		"role":      user.Role,
		"synced_at": time.Now().Unix(),
	}
	
	err = u.redisRepo.Set(ctx, sessionKey, sessionData, 30*60)
	if err != nil {
		// Redis エラーはログに記録するだけで処理は続行
		fmt.Printf("Warning: failed to cache session: %v\n", err)
	}

	return &SyncUserResponse{
		User:      user,
		School:    school,
		IsNewUser: isNewUser,
	}, nil
}

func (u *AuthUsecase) GetUserByUID(ctx context.Context, uid string) (*entities.User, error) {
	// キャッシュから確認
	sessionKey := fmt.Sprintf("session:%s", uid)
	cachedData, err := u.redisRepo.Get(ctx, sessionKey)
	if err == nil {
		var sessionData map[string]interface{}
		if json.Unmarshal([]byte(cachedData), &sessionData) == nil {
			// キャッシュがある場合でも最新情報を取得
		}
	}

	// データベースから取得
	return u.userRepo.FindByUID(ctx, uid)
}