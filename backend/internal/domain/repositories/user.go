package repositories

import (
	"context"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
)

type UserRepository interface {
	// ユーザー管理
	FindByUID(ctx context.Context, uid string) (*entities.User, error)
	FindByEmail(ctx context.Context, email string) (*entities.User, error)
	Create(ctx context.Context, user *entities.User) error
	Update(ctx context.Context, user *entities.User) error
	UpdateLastLogin(ctx context.Context, uid string) error
	
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

type RedisRepository interface {
	Set(ctx context.Context, key string, value interface{}, expiration int) error
	Get(ctx context.Context, key string) (string, error)
	Delete(ctx context.Context, key string) error
}