package usecase

import (
	"context"
	"fmt"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
)

type DashboardUsecase struct {
	userRepo      repositories.UserRepository
	dashboardRepo repositories.DashboardRepository
	config        *config.Config
}

func NewDashboardUsecase(userRepo repositories.UserRepository, cfg *config.Config) *DashboardUsecase {
	return &DashboardUsecase{
		userRepo: userRepo,
		config:   cfg,
	}
}

// SetDashboardRepository はDIのためのセッター
func (u *DashboardUsecase) SetDashboardRepository(dashboardRepo repositories.DashboardRepository) {
	u.dashboardRepo = dashboardRepo
}

func (u *DashboardUsecase) GetDashboardData(ctx context.Context, uid string, role string) (*entities.DashboardData, error) {
	// ユーザー情報を取得
	user, err := u.userRepo.FindByUID(ctx, uid)
	if err != nil {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	// TODO: Dashboard functions disabled during schema migration
	// Return minimal dashboard data for now
	return &entities.DashboardData{
		User:          user,
		Tasks:         []entities.Task{},
		Stats:         entities.Stats{},
		Notifications: []entities.Notification{},
		Schedule:      []entities.ScheduleItem{},
	}, nil
}