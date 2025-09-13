package usecase

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strconv"
	"time"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase struct {
	userRepo repositories.UserRepository
	adminRepo repositories.AdminRepository
}

func NewAuthUsecase(userRepo repositories.UserRepository, adminRepo repositories.AdminRepository) *AuthUsecase {
	return &AuthUsecase{
		userRepo: userRepo,
		adminRepo: adminRepo,
	}
}

// CreateInvitation ユーザー招待を作成
func (u *AuthUsecase) CreateInvitation(ctx context.Context, name, email, role string, schoolID string, message string) (*entities.UserInvitation, error) {
	// 招待トークンを生成
	token, err := generateSecureToken(32)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// 有効期限を設定（7日間）
	expiresAt := time.Now().Add(7 * 24 * time.Hour)

	invitation := &entities.UserInvitation{
		Name:      name,
		Email:     email,
		Role:      role,
		SchoolID:  schoolID,
		Message:   message,
		Status:    "pending",
		Token:     token,
		ExpiresAt: expiresAt,
	}

	// TODO: データベースに保存
	// invitation, err = u.adminRepo.CreateInvitation(ctx, invitation)
	// if err != nil {
	//     return nil, fmt.Errorf("failed to create invitation: %w", err)
	// }

	// TODO: 招待メールを送信
	// err = u.sendInvitationEmail(invitation)
	// if err != nil {
	//     return nil, fmt.Errorf("failed to send invitation email: %w", err)
	// }

	return invitation, nil
}

// ValidateInvitation 招待トークンを検証
func (u *AuthUsecase) ValidateInvitation(ctx context.Context, token string) (*entities.UserInvitation, error) {
	// TODO: データベースから招待情報を取得
	// invitation, err := u.adminRepo.GetInvitationByToken(ctx, token)
	// if err != nil {
	//     return nil, fmt.Errorf("invitation not found: %w", err)
	// }

	// モックデータ
	invitation := &entities.UserInvitation{
		ID:        "1",
		Name:      "テストユーザー",
		Email:     "test@example.com",
		Role:      "student",
		SchoolID:  "1",
		Status:    "pending",
		Token:     token,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	// 有効期限チェック
	if time.Now().After(invitation.ExpiresAt) {
		return nil, fmt.Errorf("invitation has expired")
	}

	// ステータスチェック
	if invitation.Status != "pending" {
		return nil, fmt.Errorf("invitation is no longer valid")
	}

	return invitation, nil
}

// RegisterUser 招待に基づいてユーザー登録
func (u *AuthUsecase) RegisterUser(ctx context.Context, token, name, email, password string) (*entities.User, error) {
	// 招待の検証
	invitation, err := u.ValidateInvitation(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("invalid invitation: %w", err)
	}

	// パスワードのハッシュ化（Firebaseでは不要だが、将来の拡張用）
	_, err = bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// SchoolIDをint64に変換
	schoolIDInt, err := strconv.ParseInt(invitation.SchoolID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid school ID: %w", err)
	}

	// ユーザー作成
	user := &entities.User{
		DisplayName:  name,
		Email:        email,
		Role:         invitation.Role,
		SchoolID:     fmt.Sprintf("%d", schoolIDInt), // Convert to string
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// TODO: データベースに保存
	// user, err = u.userRepo.CreateUser(ctx, user, string(hashedPassword))
	// if err != nil {
	//     return nil, fmt.Errorf("failed to create user: %w", err)
	// }

	// TODO: 招待ステータスを更新
	// err = u.adminRepo.UpdateInvitationStatus(ctx, invitation.ID, "accepted")
	// if err != nil {
	//     return nil, fmt.Errorf("failed to update invitation status: %w", err)
	// }

	return user, nil
}

// LoginUser ユーザーログイン
func (u *AuthUsecase) LoginUser(ctx context.Context, email, password string) (*entities.User, error) {
	// TODO: データベースからユーザーを取得
	// user, err := u.userRepo.GetUserByEmail(ctx, email)
	// if err != nil {
	//     return nil, fmt.Errorf("user not found: %w", err)
	// }

	// モックデータ
	user := &entities.User{
		ID:          "test-uuid-1",
		DisplayName: "テストユーザー",
		Email:       email,
		Role:        "student",
		SchoolID:    "1",
	}

	// アクティブ状態チェック（現在のスキーマでは省略）
	// TODO: アクティブ状態チェックの実装

	// TODO: パスワード検証
	// err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	// if err != nil {
	//     return nil, fmt.Errorf("invalid password: %w", err)
	// }

	return user, nil
}

// SyncUser Firebase認証とデータベースの同期
func (u *AuthUsecase) SyncUser(ctx context.Context, firebaseUID, email string, displayName, schoolID, role *string) (*entities.User, error) {
	// 既存ユーザーをチェック
	existingUser, err := u.userRepo.GetUserByFirebaseUID(ctx, firebaseUID)
	if err == nil && existingUser != nil {
		// 既存ユーザーの場合は更新
		updateData := entities.User{
			Email: email,
		}
		
		if displayName != nil {
			updateData.DisplayName = *displayName
		}
		if role != nil {
			updateData.Role = *role
		}
		if schoolID != nil {
			updateData.SchoolID = *schoolID // Use string directly
		}
		
		updatedUser, err := u.userRepo.UpdateUser(ctx, existingUser.ID, updateData)
		if err != nil {
			return nil, fmt.Errorf("failed to update user: %w", err)
		}
		
		return updatedUser, nil
	}
	
	// 新規ユーザーの場合は作成
	newUser := &entities.User{
		FirebaseUID: firebaseUID,
		Email:       email,
		DisplayName: email, // デフォルトはメールアドレス
		Role:        "student", // デフォルトロール
		SchoolID:    "1",  // デフォルト学校ID
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	
	if displayName != nil && *displayName != "" {
		newUser.DisplayName = *displayName
	}
	if role != nil {
		newUser.Role = *role
	}
	if schoolID != nil {
		newUser.SchoolID = *schoolID // Use string directly
	}
	
	createdUser, err := u.userRepo.CreateUser(ctx, newUser)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}
	
	return createdUser, nil
}

// GetUserByFirebaseUID Firebase UIDでユーザーを取得
func (u *AuthUsecase) GetUserByFirebaseUID(ctx context.Context, firebaseUID string) (*entities.User, error) {
	user, err := u.userRepo.GetUserByFirebaseUID(ctx, firebaseUID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	
	return user, nil
}

// generateSecureToken セキュアなトークンを生成
func generateSecureToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}