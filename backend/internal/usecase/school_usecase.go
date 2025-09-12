package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
)

type SchoolUsecase struct {
	schoolRepo repositories.SchoolRepository
	userRepo   repositories.UserRepository
	config     *config.Config
}

func NewSchoolUsecase(schoolRepo repositories.SchoolRepository, userRepo repositories.UserRepository, config *config.Config) *SchoolUsecase {
	return &SchoolUsecase{
		schoolRepo: schoolRepo,
		userRepo:   userRepo,
		config:     config,
	}
}

// CreateSchool 学校を作成
func (u *SchoolUsecase) CreateSchool(ctx context.Context, school *entities.School) (*entities.School, error) {
	// コードの重複チェック
	existingSchool, err := u.schoolRepo.GetSchoolByCode(ctx, school.Code)
	if err == nil && existingSchool != nil {
		return nil, fmt.Errorf("school code already exists: %s", school.Code)
	}

	// 作成時刻を設定
	now := time.Now()
	school.CreatedAt = now
	school.UpdatedAt = now

	// デフォルト値の設定
	if school.ThemeColor == "" {
		school.ThemeColor = u.config.ThemeColor
	}
	if school.BackgroundColor == "" {
		school.BackgroundColor = u.config.BackgroundColor
	}
	if school.StudentCapacity == 0 {
		school.StudentCapacity = 500
	}
	if school.AcademicYearStart == 0 {
		school.AcademicYearStart = 4
	}
	if school.Settings == "" {
		school.Settings = fmt.Sprintf(`{"theme": "coral", "background": "%s"}`, school.BackgroundColor)
	}

	// 学校作成
	createdSchool, err := u.schoolRepo.CreateSchool(ctx, school)
	if err != nil {
		return nil, fmt.Errorf("failed to create school: %w", err)
	}

	return createdSchool, nil
}

// GetSchoolByID IDで学校を取得
func (u *SchoolUsecase) GetSchoolByID(ctx context.Context, schoolID int64) (*entities.School, error) {
	school, err := u.schoolRepo.GetSchoolByID(ctx, schoolID)
	if err != nil {
		return nil, fmt.Errorf("school not found: %w", err)
	}

	return school, nil
}

// GetSchoolByCode コードで学校を取得
func (u *SchoolUsecase) GetSchoolByCode(ctx context.Context, code string) (*entities.School, error) {
	school, err := u.schoolRepo.GetSchoolByCode(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("school not found: %w", err)
	}

	return school, nil
}

// GetAllSchools すべての学校を取得（フィルタ付き）
func (u *SchoolUsecase) GetAllSchools(ctx context.Context, filters map[string]interface{}) ([]*entities.School, error) {
	schools, err := u.schoolRepo.GetAllSchools(ctx, filters)
	if err != nil {
		return nil, fmt.Errorf("failed to get schools: %w", err)
	}

	return schools, nil
}

// UpdateSchool 学校情報を更新
func (u *SchoolUsecase) UpdateSchool(ctx context.Context, schoolID int64, updateData entities.School) (*entities.School, error) {
	// 既存の学校をチェック
	existingSchool, err := u.schoolRepo.GetSchoolByID(ctx, schoolID)
	if err != nil {
		return nil, fmt.Errorf("school not found: %w", err)
	}

	// コードが変更される場合の重複チェック
	if updateData.Code != existingSchool.Code {
		conflictSchool, err := u.schoolRepo.GetSchoolByCode(ctx, updateData.Code)
		if err == nil && conflictSchool != nil && conflictSchool.ID != schoolID {
			return nil, fmt.Errorf("school code already exists: %s", updateData.Code)
		}
	}

	// デフォルト値の維持
	if updateData.ThemeColor == "" {
		updateData.ThemeColor = existingSchool.ThemeColor
	}
	if updateData.BackgroundColor == "" {
		updateData.BackgroundColor = existingSchool.BackgroundColor
	}
	if updateData.StudentCapacity == 0 {
		updateData.StudentCapacity = existingSchool.StudentCapacity
	}
	if updateData.AcademicYearStart == 0 {
		updateData.AcademicYearStart = existingSchool.AcademicYearStart
	}
	if updateData.Settings == "" {
		updateData.Settings = existingSchool.Settings
	}

	// 学校更新
	updatedSchool, err := u.schoolRepo.UpdateSchool(ctx, schoolID, updateData)
	if err != nil {
		return nil, fmt.Errorf("failed to update school: %w", err)
	}

	return updatedSchool, nil
}

// DeleteSchool 学校を削除（論理削除）
func (u *SchoolUsecase) DeleteSchool(ctx context.Context, schoolID int64) error {
	// 学校の存在チェック
	_, err := u.schoolRepo.GetSchoolByID(ctx, schoolID)
	if err != nil {
		return fmt.Errorf("school not found: %w", err)
	}

	// 学校に所属するユーザーがいるかチェック
	users, err := u.schoolRepo.GetSchoolUsers(ctx, schoolID, "")
	if err != nil {
		return fmt.Errorf("failed to check school users: %w", err)
	}

	if len(users) > 0 {
		return fmt.Errorf("cannot delete school with existing users (%d users found)", len(users))
	}

	// 学校削除（論理削除）
	err = u.schoolRepo.DeleteSchool(ctx, schoolID)
	if err != nil {
		return fmt.Errorf("failed to delete school: %w", err)
	}

	return nil
}

// GetSchoolStats 学校の統計情報を取得
func (u *SchoolUsecase) GetSchoolStats(ctx context.Context, schoolID int64) (map[string]interface{}, error) {
	// 学校の存在チェック
	school, err := u.schoolRepo.GetSchoolByID(ctx, schoolID)
	if err != nil {
		return nil, fmt.Errorf("school not found: %w", err)
	}

	// 統計情報を取得
	stats, err := u.schoolRepo.GetSchoolStats(ctx, schoolID)
	if err != nil {
		return nil, fmt.Errorf("failed to get school stats: %w", err)
	}

	// 学校基本情報も含める
	stats["school_name"] = school.Name
	stats["school_code"] = school.Code
	stats["student_capacity"] = school.StudentCapacity

	// 使用率を計算
	if studentCount, ok := stats["student_count"].(int); ok && school.StudentCapacity > 0 {
		stats["capacity_usage"] = float64(studentCount) / float64(school.StudentCapacity) * 100
	}

	return stats, nil
}

// GetSchoolUsers 学校のユーザー一覧を取得
func (u *SchoolUsecase) GetSchoolUsers(ctx context.Context, schoolID int64, role string) ([]*entities.User, error) {
	// 学校の存在チェック
	_, err := u.schoolRepo.GetSchoolByID(ctx, schoolID)
	if err != nil {
		return nil, fmt.Errorf("school not found: %w", err)
	}

	// ユーザー一覧を取得
	users, err := u.schoolRepo.GetSchoolUsers(ctx, schoolID, role)
	if err != nil {
		return nil, fmt.Errorf("failed to get school users: %w", err)
	}

	return users, nil
}

// ValidateSchoolCode 学校コードの妥当性をチェック
func (u *SchoolUsecase) ValidateSchoolCode(ctx context.Context, code string) (bool, error) {
	if len(code) < 3 || len(code) > 10 {
		return false, fmt.Errorf("school code must be between 3 and 10 characters")
	}

	// 既存コードとの重複チェック
	existingSchool, err := u.schoolRepo.GetSchoolByCode(ctx, code)
	if err == nil && existingSchool != nil {
		return false, fmt.Errorf("school code already exists")
	}

	return true, nil
}

// CreateStudentForSchool 学校に生徒を作成
func (u *SchoolUsecase) CreateStudentForSchool(ctx context.Context, schoolID int64, student *entities.User) (*entities.User, error) {
	// 学校の存在チェック
	school, err := u.schoolRepo.GetSchoolByID(ctx, schoolID)
	if err != nil {
		return nil, fmt.Errorf("school not found: %w", err)
	}

	// 容量チェック
	stats, err := u.schoolRepo.GetSchoolStats(ctx, schoolID)
	if err != nil {
		return nil, fmt.Errorf("failed to get school stats: %w", err)
	}

	if studentCount, ok := stats["student_count"].(int); ok {
		if studentCount >= school.StudentCapacity {
			return nil, fmt.Errorf("school capacity exceeded (current: %d, capacity: %d)", studentCount, school.StudentCapacity)
		}
	}

	// 生徒情報設定
	student.SchoolID = schoolID
	student.Role = "student"
	student.IsActive = true
	student.IsApproved = true

	// 生徒作成
	createdStudent, err := u.userRepo.CreateUser(ctx, student)
	if err != nil {
		return nil, fmt.Errorf("failed to create student: %w", err)
	}

	return createdStudent, nil
}