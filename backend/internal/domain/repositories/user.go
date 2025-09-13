package repositories

import (
    "context"
    "time"

    "github.com/rikut0904/bloomia/backend/internal/domain/entities"
)

type UserRepository interface {
	// ユーザー管理
	FindByUID(ctx context.Context, uid string) (*entities.User, error)
	FindByEmail(ctx context.Context, email string) (*entities.User, error)
	Create(ctx context.Context, user *entities.User) error
	Update(ctx context.Context, user *entities.User) error
	UpdateLastLogin(ctx context.Context, uid string) error
	
	// Firebase認証関連
	GetUserByFirebaseUID(ctx context.Context, firebaseUID string) (*entities.User, error)
	CreateUser(ctx context.Context, user *entities.User) (*entities.User, error)
	UpdateUser(ctx context.Context, userID string, updateData entities.User) (*entities.User, error)
	
	// 学校関連
	FindSchoolByID(ctx context.Context, schoolID int64) (*entities.School, error)
	FindSchoolByEmailDomain(ctx context.Context, domain string) (*entities.School, error)
	
	// クラス関連
	FindClassByID(ctx context.Context, classID int64) (*entities.Class, error)
}

type DashboardRepository interface {
	// ダッシュボード関連データ取得
	GetUserTasks(ctx context.Context, userID int64, schoolID int64) ([]entities.Task, error)
	GetUserStats(ctx context.Context, userID int64, schoolID int64, role string) (*entities.Stats, error)
	GetUserNotifications(ctx context.Context, userID int64, schoolID int64) ([]entities.Notification, error)
	GetUserSchedule(ctx context.Context, userID int64, schoolID int64) ([]entities.ScheduleItem, error)
}

type AdminRepository interface {
    // ユーザー管理
    GetAllUsers(ctx context.Context, page, perPage int, schoolID *string) ([]entities.UserManagement, int, error)
    UpdateUserRole(ctx context.Context, userID string, role string, schoolID *string) error
    UpdateUserStatus(ctx context.Context, userID string, isActive, isApproved bool) error
    GetUserByID(ctx context.Context, userID string) (*entities.UserManagement, error)
    
    // 学校管理
    GetAllSchools(ctx context.Context) ([]entities.SchoolOption, error)
    
    // 統計情報
    GetUserStatsByRole(ctx context.Context, schoolID *string) (map[string]int, error)

    // 招待
    CreateUserInvitation(ctx context.Context, name, email, role, schoolID, message, token string, expiresAt time.Time) error
}

type SchoolRepository interface {
	// 学校CRUD操作
	CreateSchool(ctx context.Context, school *entities.School) (*entities.School, error)
	GetSchoolByID(ctx context.Context, schoolID int64) (*entities.School, error)
	GetSchoolByCode(ctx context.Context, code string) (*entities.School, error)
	GetAllSchools(ctx context.Context, filters map[string]interface{}) ([]*entities.School, error)
	UpdateSchool(ctx context.Context, schoolID int64, updateData entities.School) (*entities.School, error)
	DeleteSchool(ctx context.Context, schoolID int64) error
	
	// 学校統計・管理
	GetSchoolStats(ctx context.Context, schoolID int64) (map[string]interface{}, error)
	GetSchoolUsers(ctx context.Context, schoolID int64, role string) ([]*entities.User, error)
}

type RedisRepository interface {
	Set(ctx context.Context, key string, value interface{}, expiration int) error
	Get(ctx context.Context, key string) (string, error)
	Delete(ctx context.Context, key string) error
}
