package dashboard

import (
	"context"
	"database/sql"
	"time"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
)

type dashboardRepository struct {
	db *sql.DB
}

func NewDashboardRepository(db *sql.DB) repositories.DashboardRepository {
	return &dashboardRepository{db: db}
}

func (r *dashboardRepository) GetUserTasks(ctx context.Context, userID int64, schoolID int64) ([]entities.Task, error) {
	// 実際のテーブルがない場合のモックデータを返す
	// 将来的にはtasksテーブルから取得
	tasks := []entities.Task{
		{
			ID:       1,
			Title:    "国語の予習",
			Type:     "homework",
			Priority: "medium",
			DueDate:  timePtr(time.Now().Add(24 * time.Hour)), // 明日
			UserID:   userID,
			SchoolID: schoolID,
		},
		{
			ID:       2,
			Title:    "数学の課題提出",
			Type:     "assignment",
			Priority: "high",
			DueDate:  timePtr(time.Now().Add(48 * time.Hour)), // 明後日
			UserID:   userID,
			SchoolID: schoolID,
		},
		{
			ID:       3,
			Title:    "プログラミング演習",
			Type:     "practice",
			Priority: "low",
			UserID:   userID,
			SchoolID: schoolID,
		},
	}

	return tasks, nil
}

func (r *dashboardRepository) GetUserStats(ctx context.Context, userID int64, schoolID int64, role string) (*entities.Stats, error) {
	// ロール別のモック統計データ
	if role == "teacher" {
		return &entities.Stats{
			AssignmentsPending:   15, // 未採点課題数
			AssignmentsCompleted: 42, // 採点済み課題数
			AttendanceRate:       98.1, // 担当クラスの出席率
			Points:               0,  // 教師は対象外
			Rank:                 nil, // 教師は対象外
		}, nil
	}

	// 学生用統計
	return &entities.Stats{
		AssignmentsPending:   3,
		AssignmentsCompleted: 8,
		AttendanceRate:       95.2,
		Points:               1250,
		Rank:                 intPtr(15),
	}, nil
}

func (r *dashboardRepository) GetUserNotifications(ctx context.Context, userID int64, schoolID int64) ([]entities.Notification, error) {
	// モック通知データ
	notifications := []entities.Notification{
		{
			ID:        1,
			Title:     "新しい課題が追加されました",
			Message:   "数学の宿題が追加されました。期限は明日です。",
			Type:      "assignment",
			UserID:    userID,
			SchoolID:  schoolID,
			IsRead:    false,
			CreatedAt: time.Now(),
		},
		{
			ID:        2,
			Title:     "成績が更新されました",
			Message:   "国語のテスト結果が公開されました。",
			Type:      "grade",
			UserID:    userID,
			SchoolID:  schoolID,
			IsRead:    false,
			CreatedAt: time.Now().Add(-2 * time.Hour), // 2時間前
		},
	}

	return notifications, nil
}

func (r *dashboardRepository) GetUserSchedule(ctx context.Context, userID int64, schoolID int64) ([]entities.ScheduleItem, error) {
	// モック時間割データ
	schedule := []entities.ScheduleItem{
		{Period: 1, Subject: "国語", Teacher: "田中先生", Classroom: "2-A教室"},
		{Period: 2, Subject: "数学", Teacher: "佐藤先生", Classroom: "2-A教室"},
		{Period: 3, Subject: "英語", Teacher: "鈴木先生", Classroom: "英語教室"},
		{Period: 4, Subject: "理科", Teacher: "山田先生", Classroom: "理科室"},
		{Period: 5, Subject: "社会", Teacher: "高橋先生", Classroom: "2-A教室"},
		{Period: 6, Subject: "プログラミング", Teacher: "伊藤先生", Classroom: "PC室"},
	}

	return schedule, nil
}

// ヘルパー関数
func timePtr(t time.Time) *time.Time {
	return &t
}

func intPtr(i int) *int {
	return &i
}