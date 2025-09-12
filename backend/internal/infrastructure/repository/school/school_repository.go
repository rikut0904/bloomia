package school

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
)

type schoolRepository struct {
	db *sql.DB
}

func NewSchoolRepository(db *sql.DB) repositories.SchoolRepository {
	return &schoolRepository{db: db}
}

// CreateSchool 学校を作成
func (r *schoolRepository) CreateSchool(ctx context.Context, school *entities.School) (*entities.School, error) {
	query := `
		INSERT INTO schools (name, code, email_domain, theme_color, background_color, logo_url,
							address, phone_number, principal_name, vice_principal_name, 
							student_capacity, settings, academic_year_start, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(ctx, query,
		school.Name,
		school.Code,
		school.EmailDomain,
		school.ThemeColor,
		school.BackgroundColor,
		school.LogoURL,
		school.Address,
		school.PhoneNumber,
		school.PrincipalName,
		school.VicePrincipalName,
		school.StudentCapacity,
		school.Settings,
		school.AcademicYearStart,
		school.IsActive,
	).Scan(&school.ID, &school.CreatedAt, &school.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create school: %w", err)
	}

	return school, nil
}

// GetSchoolByID IDで学校を取得
func (r *schoolRepository) GetSchoolByID(ctx context.Context, schoolID int64) (*entities.School, error) {
	query := `
		SELECT id, name, code, email_domain, theme_color, background_color, logo_url,
			   address, phone_number, principal_name, vice_principal_name, 
			   student_capacity, settings, academic_year_start, is_active, 
			   created_at, updated_at
		FROM schools 
		WHERE id = $1
	`
	
	var school entities.School
	err := r.db.QueryRowContext(ctx, query, schoolID).Scan(
		&school.ID,
		&school.Name,
		&school.Code,
		&school.EmailDomain,
		&school.ThemeColor,
		&school.BackgroundColor,
		&school.LogoURL,
		&school.Address,
		&school.PhoneNumber,
		&school.PrincipalName,
		&school.VicePrincipalName,
		&school.StudentCapacity,
		&school.Settings,
		&school.AcademicYearStart,
		&school.IsActive,
		&school.CreatedAt,
		&school.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("school not found with id: %d", schoolID)
		}
		return nil, fmt.Errorf("failed to find school by id: %w", err)
	}

	return &school, nil
}

// GetSchoolByCode コードで学校を取得
func (r *schoolRepository) GetSchoolByCode(ctx context.Context, code string) (*entities.School, error) {
	query := `
		SELECT id, name, code, email_domain, theme_color, background_color, logo_url,
			   address, phone_number, principal_name, vice_principal_name, 
			   student_capacity, settings, academic_year_start, is_active, 
			   created_at, updated_at
		FROM schools 
		WHERE code = $1
	`
	
	var school entities.School
	err := r.db.QueryRowContext(ctx, query, code).Scan(
		&school.ID,
		&school.Name,
		&school.Code,
		&school.EmailDomain,
		&school.ThemeColor,
		&school.BackgroundColor,
		&school.LogoURL,
		&school.Address,
		&school.PhoneNumber,
		&school.PrincipalName,
		&school.VicePrincipalName,
		&school.StudentCapacity,
		&school.Settings,
		&school.AcademicYearStart,
		&school.IsActive,
		&school.CreatedAt,
		&school.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("school not found with code: %s", code)
		}
		return nil, fmt.Errorf("failed to find school by code: %w", err)
	}

	return &school, nil
}

// GetAllSchools すべての学校を取得（フィルタ付き）
func (r *schoolRepository) GetAllSchools(ctx context.Context, filters map[string]interface{}) ([]*entities.School, error) {
	baseQuery := `
		SELECT id, name, code, email_domain, theme_color, background_color, logo_url,
			   address, phone_number, principal_name, vice_principal_name, 
			   student_capacity, settings, academic_year_start, is_active, 
			   created_at, updated_at
		FROM schools 
		WHERE 1=1
	`
	
	args := []interface{}{}
	argIndex := 1
	
	// アクティブフィルタ（デフォルトはアクティブのみ）
	if activeFilter, exists := filters["is_active"]; exists {
		baseQuery += fmt.Sprintf(" AND is_active = $%d", argIndex)
		args = append(args, activeFilter)
		argIndex++
	} else {
		baseQuery += fmt.Sprintf(" AND is_active = $%d", argIndex)
		args = append(args, true)
		argIndex++
	}
	
	// 検索フィルタ
	if search, exists := filters["search"]; exists && search != "" {
		baseQuery += fmt.Sprintf(" AND (name ILIKE $%d OR code ILIKE $%d OR address ILIKE $%d)", argIndex, argIndex, argIndex)
		searchPattern := fmt.Sprintf("%%%s%%", search)
		args = append(args, searchPattern)
		argIndex++
	}
	
	baseQuery += " ORDER BY name"
	
	rows, err := r.db.QueryContext(ctx, baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query schools: %w", err)
	}
	defer rows.Close()

	var schools []*entities.School
	for rows.Next() {
		var school entities.School
		err := rows.Scan(
			&school.ID,
			&school.Name,
			&school.Code,
			&school.EmailDomain,
			&school.ThemeColor,
			&school.BackgroundColor,
			&school.LogoURL,
			&school.Address,
			&school.PhoneNumber,
			&school.PrincipalName,
			&school.VicePrincipalName,
			&school.StudentCapacity,
			&school.Settings,
			&school.AcademicYearStart,
			&school.IsActive,
			&school.CreatedAt,
			&school.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan school: %w", err)
		}
		schools = append(schools, &school)
	}

	return schools, nil
}

// UpdateSchool 学校情報を更新
func (r *schoolRepository) UpdateSchool(ctx context.Context, schoolID int64, updateData entities.School) (*entities.School, error) {
	query := `
		UPDATE schools 
		SET name = $2, code = $3, email_domain = $4, theme_color = $5, 
			background_color = $6, logo_url = $7, address = $8, phone_number = $9, 
			principal_name = $10, vice_principal_name = $11, student_capacity = $12, 
			settings = $13, academic_year_start = $14, updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, code, email_domain, theme_color, background_color, logo_url,
				  address, phone_number, principal_name, vice_principal_name, 
				  student_capacity, settings, academic_year_start, is_active, 
				  created_at, updated_at
	`

	var school entities.School
	err := r.db.QueryRowContext(ctx, query,
		schoolID,
		updateData.Name,
		updateData.Code,
		updateData.EmailDomain,
		updateData.ThemeColor,
		updateData.BackgroundColor,
		updateData.LogoURL,
		updateData.Address,
		updateData.PhoneNumber,
		updateData.PrincipalName,
		updateData.VicePrincipalName,
		updateData.StudentCapacity,
		updateData.Settings,
		updateData.AcademicYearStart,
	).Scan(
		&school.ID,
		&school.Name,
		&school.Code,
		&school.EmailDomain,
		&school.ThemeColor,
		&school.BackgroundColor,
		&school.LogoURL,
		&school.Address,
		&school.PhoneNumber,
		&school.PrincipalName,
		&school.VicePrincipalName,
		&school.StudentCapacity,
		&school.Settings,
		&school.AcademicYearStart,
		&school.IsActive,
		&school.CreatedAt,
		&school.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("school not found for update: %d", schoolID)
		}
		return nil, fmt.Errorf("failed to update school: %w", err)
	}

	return &school, nil
}

// DeleteSchool 学校を削除（論理削除）
func (r *schoolRepository) DeleteSchool(ctx context.Context, schoolID int64) error {
	query := `
		UPDATE schools 
		SET is_active = false, updated_at = NOW()
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query, schoolID)
	if err != nil {
		return fmt.Errorf("failed to delete school: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("school not found with id: %d", schoolID)
	}

	return nil
}

// GetSchoolStats 学校の統計情報を取得
func (r *schoolRepository) GetSchoolStats(ctx context.Context, schoolID int64) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count,
			COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teacher_count,
			COUNT(CASE WHEN role = 'school_admin' THEN 1 END) as admin_count,
			COUNT(*) as total_users
		FROM users 
		WHERE school_id = $1 AND is_active = true
	`

	var studentCount, teacherCount, adminCount, totalUsers int
	err := r.db.QueryRowContext(ctx, query, schoolID).Scan(
		&studentCount, &teacherCount, &adminCount, &totalUsers,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get school stats: %w", err)
	}

	stats := map[string]interface{}{
		"student_count": studentCount,
		"teacher_count": teacherCount,
		"admin_count":   adminCount,
		"total_users":   totalUsers,
	}

	return stats, nil
}

// GetSchoolUsers 学校のユーザー一覧を取得
func (r *schoolRepository) GetSchoolUsers(ctx context.Context, schoolID int64, role string) ([]*entities.User, error) {
	baseQuery := `
		SELECT id, firebase_uid, name, furigana, email, avatar_url, role, school_id, class_id, 
			   student_number, grade, is_active, is_approved, ui_preferences, 
			   last_login_at, created_at, updated_at
		FROM users 
		WHERE school_id = $1 AND is_active = true
	`
	
	args := []interface{}{schoolID}
	argIndex := 2
	
	if role != "" && role != "all" {
		baseQuery += fmt.Sprintf(" AND role = $%d", argIndex)
		args = append(args, role)
		argIndex++
	}
	
	baseQuery += " ORDER BY role, name"
	
	rows, err := r.db.QueryContext(ctx, baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query school users: %w", err)
	}
	defer rows.Close()

	var users []*entities.User
	for rows.Next() {
		var user entities.User
		err := rows.Scan(
			&user.ID,
			&user.FirebaseUID,
			&user.Name,
			&user.Furigana,
			&user.Email,
			&user.AvatarURL,
			&user.Role,
			&user.SchoolID,
			&user.ClassID,
			&user.StudentNumber,
			&user.Grade,
			&user.IsActive,
			&user.IsApproved,
			&user.UIPreferences,
			&user.LastLoginAt,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, &user)
	}

	return users, nil
}