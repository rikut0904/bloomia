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

	if u.dashboardRepo == nil {
		return nil, fmt.Errorf("dashboard repository not initialized")
	}

	// 並行してダッシュボードデータを取得
	tasksCh := make(chan []entities.Task)
	statsCh := make(chan *entities.Stats)
	notificationsCh := make(chan []entities.Notification)
	scheduleCh := make(chan []entities.ScheduleItem)
	errCh := make(chan error, 4)

	// タスク取得
	go func() {
		tasks, err := u.dashboardRepo.GetUserTasks(ctx, user.ID, user.SchoolID)
		if err != nil {
			errCh <- fmt.Errorf("failed to get tasks: %w", err)
			return
		}
		tasksCh <- tasks
	}()

	// 統計取得
	go func() {
		stats, err := u.dashboardRepo.GetUserStats(ctx, user.ID, user.SchoolID, user.Role)
		if err != nil {
			errCh <- fmt.Errorf("failed to get stats: %w", err)
			return
		}
		statsCh <- stats
	}()

	// 通知取得
	go func() {
		notifications, err := u.dashboardRepo.GetUserNotifications(ctx, user.ID, user.SchoolID)
		if err != nil {
			errCh <- fmt.Errorf("failed to get notifications: %w", err)
			return
		}
		notificationsCh <- notifications
	}()

	// スケジュール取得
	go func() {
		schedule, err := u.dashboardRepo.GetUserSchedule(ctx, user.ID, user.SchoolID)
		if err != nil {
			errCh <- fmt.Errorf("failed to get schedule: %w", err)
			return
		}
		scheduleCh <- schedule
	}()

	// 結果を収集
	var tasks []entities.Task
	var stats *entities.Stats
	var notifications []entities.Notification
	var schedule []entities.ScheduleItem

	for i := 0; i < 4; i++ {
		select {
		case tasks = <-tasksCh:
		case stats = <-statsCh:
		case notifications = <-notificationsCh:
		case schedule = <-scheduleCh:
		case err := <-errCh:
			return nil, err
		}
	}

	return &entities.DashboardData{
		User:          user,
		Tasks:         tasks,
		Stats:         *stats,
		Notifications: notifications,
		Schedule:      schedule,
	}, nil
}