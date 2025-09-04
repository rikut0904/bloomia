package user

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
)

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) repositories.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByUID(ctx context.Context, uid string) (*entities.User, error) {
	query := `
		SELECT id, uid, name, furigana, email, avatar_url, role, school_id, class_id, 
			   student_number, grade, is_active, is_approved, ui_preferences, 
			   last_login_at, created_at, updated_at
		FROM users 
		WHERE uid = $1 AND is_active = true
	`
	
	var user entities.User
	err := r.db.QueryRowContext(ctx, query, uid).Scan(
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
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found with uid: %s", uid)
		}
		return nil, fmt.Errorf("failed to find user by uid: %w", err)
	}

	return &user, nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*entities.User, error) {
	query := `
		SELECT id, uid, name, furigana, email, avatar_url, role, school_id, class_id, 
			   student_number, grade, is_active, is_approved, ui_preferences, 
			   last_login_at, created_at, updated_at
		FROM users 
		WHERE email = $1 AND is_active = true
	`
	
	var user entities.User
	err := r.db.QueryRowContext(ctx, query, email).Scan(
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
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found with email: %s", email)
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}

	return &user, nil
}

func (r *userRepository) Create(ctx context.Context, user *entities.User) error {
	query := `
		INSERT INTO users (uid, name, furigana, email, avatar_url, role, school_id, class_id, 
						   student_number, grade, ui_preferences, is_active, is_approved)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(ctx, query,
		user.FirebaseUID,
		user.Name,
		user.Furigana,
		user.Email,
		user.AvatarURL,
		user.Role,
		user.SchoolID,
		user.ClassID,
		user.StudentNumber,
		user.Grade,
		user.UIPreferences,
		user.IsActive,
		user.IsApproved,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *userRepository) Update(ctx context.Context, user *entities.User) error {
	query := `
		UPDATE users 
		SET name = $2, furigana = $3, email = $4, avatar_url = $5, role = $6, 
			class_id = $7, student_number = $8, grade = $9, ui_preferences = $10, 
			is_approved = $11, updated_at = NOW()
		WHERE uid = $1 AND is_active = true
		RETURNING updated_at
	`

	err := r.db.QueryRowContext(ctx, query,
		user.FirebaseUID,
		user.Name,
		user.Furigana,
		user.Email,
		user.AvatarURL,
		user.Role,
		user.ClassID,
		user.StudentNumber,
		user.Grade,
		user.UIPreferences,
		user.IsApproved,
	).Scan(&user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("user not found for update: %s", user.FirebaseUID)
		}
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, uid string) error {
	query := `
		UPDATE users 
		SET last_login_at = NOW() 
		WHERE uid = $1 AND is_active = true
	`

	_, err := r.db.ExecContext(ctx, query, uid)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	return nil
}

func (r *userRepository) FindSchoolByID(ctx context.Context, schoolID int64) (*entities.School, error) {
	query := `
		SELECT id, name, code, email_domain, theme_color, background_color, logo_url,
			   address, phone_number, settings, is_active, created_at, updated_at
		FROM schools 
		WHERE id = $1 AND is_active = true
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
		&school.Settings,
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

func (r *userRepository) FindSchoolByEmailDomain(ctx context.Context, domain string) (*entities.School, error) {
	query := `
		SELECT id, name, code, email_domain, theme_color, background_color, logo_url,
			   address, phone_number, settings, is_active, created_at, updated_at
		FROM schools 
		WHERE email_domain = $1 AND is_active = true
	`
	
	var school entities.School
	err := r.db.QueryRowContext(ctx, query, domain).Scan(
		&school.ID,
		&school.Name,
		&school.Code,
		&school.EmailDomain,
		&school.ThemeColor,
		&school.BackgroundColor,
		&school.LogoURL,
		&school.Address,
		&school.PhoneNumber,
		&school.Settings,
		&school.IsActive,
		&school.CreatedAt,
		&school.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("school not found with domain: %s", domain)
		}
		return nil, fmt.Errorf("failed to find school by domain: %w", err)
	}

	return &school, nil
}

func (r *userRepository) FindClassByID(ctx context.Context, classID int64) (*entities.Class, error) {
	query := `
		SELECT id, school_id, name, grade, academic_year, homeroom_teacher_id, sub_teacher_id,
			   max_students, current_students, classroom, class_motto, class_color, 
			   is_active, created_at, updated_at
		FROM classes 
		WHERE id = $1 AND is_active = true
	`
	
	var class entities.Class
	err := r.db.QueryRowContext(ctx, query, classID).Scan(
		&class.ID,
		&class.SchoolID,
		&class.Name,
		&class.Grade,
		&class.AcademicYear,
		&class.HomeroomTeacherID,
		&class.SubTeacherID,
		&class.MaxStudents,
		&class.CurrentStudents,
		&class.Classroom,
		&class.ClassMotto,
		&class.ClassColor,
		&class.IsActive,
		&class.CreatedAt,
		&class.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("class not found with id: %d", classID)
		}
		return nil, fmt.Errorf("failed to find class by id: %w", err)
	}

	return &class, nil
}