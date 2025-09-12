package admin

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
)

type adminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) repositories.AdminRepository {
	return &adminRepository{db: db}
}

func (r *adminRepository) GetAllUsers(ctx context.Context, page, perPage int, schoolID *string) ([]entities.UserManagement, int, error) {
	// Count total users
	countQuery := `
		SELECT COUNT(*) 
		FROM users u 
		LEFT JOIN schools s ON u.school_id = s.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIndex := 1

	if schoolID != nil {
		countQuery += fmt.Sprintf(" AND u.school_id = $%d", argIndex)
		args = append(args, *schoolID)
		argIndex++
	}

	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	// Get paginated users
	query := `
		SELECT u.id, u.firebase_uid, u.name, u.email, u.role, 
			   u.school_id, s.name,
			   u.is_active, u.is_approved,
			   u.created_at, u.updated_at
		FROM users u
		LEFT JOIN schools s ON u.school_id = s.id
		WHERE 1=1
	`

	if schoolID != nil {
		query += fmt.Sprintf(" AND u.school_id = $%d", argIndex)
		args = append(args, *schoolID)
		argIndex++
	}

	query += fmt.Sprintf(" ORDER BY u.created_at DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, perPage, (page-1)*perPage)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []entities.UserManagement
	for rows.Next() {
		var user entities.UserManagement
		var schoolID sql.NullInt64
		var schoolName sql.NullString
		
		err := rows.Scan(
			&user.ID,
			&user.FirebaseUID,
			&user.Name,
			&user.Email,
			&user.Role,
			&schoolID,
			&schoolName,
			&user.IsActive,
			&user.IsApproved,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan user: %w", err)
		}
		
		// NULLチェックしてポインターに変換
		if schoolID.Valid {
			schoolIDStr := fmt.Sprintf("%d", schoolID.Int64)
			user.SchoolID = &schoolIDStr
		}
		if schoolName.Valid {
			user.SchoolName = &schoolName.String
		}
		
		users = append(users, user)
	}

	return users, totalCount, nil
}

func (r *adminRepository) UpdateUserRole(ctx context.Context, userID string, role string, schoolID *string) error {
	query := `
		UPDATE users 
		SET role = $2, school_id = COALESCE($3, school_id), updated_at = NOW()
		WHERE id::text = $1
	`
	
	_, err := r.db.ExecContext(ctx, query, userID, role, schoolID)
	if err != nil {
		return fmt.Errorf("failed to update user role: %w", err)
	}
	
	return nil
}

func (r *adminRepository) UpdateUserStatus(ctx context.Context, userID string, isActive, isApproved bool) error {
	query := `
		UPDATE users 
		SET is_active = $2, is_approved = $3, updated_at = NOW()
		WHERE id = $1
	`
	
	_, err := r.db.ExecContext(ctx, query, userID, isActive, isApproved)
	if err != nil {
		return fmt.Errorf("failed to update user status: %w", err)
	}
	
	return nil
}

func (r *adminRepository) GetUserByID(ctx context.Context, userID string) (*entities.UserManagement, error) {
	query := `
		SELECT u.id, u.firebase_uid, u.name, u.email, u.role, 
			   u.school_id, s.name,
			   u.is_active, u.is_approved,
			   u.created_at, u.updated_at
		FROM users u
		LEFT JOIN schools s ON u.school_id = s.id
		WHERE u.id = $1
	`
	
	var user entities.UserManagement
	var schoolID sql.NullInt64
	var schoolName sql.NullString
	
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&user.ID,
		&user.FirebaseUID,
		&user.Name,
		&user.Email,
		&user.Role,
		&schoolID,
		&schoolName,
		&user.IsActive,
		&user.IsApproved,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	// NULLチェックしてポインターに変換
	if schoolID.Valid {
		schoolIDStr := fmt.Sprintf("%d", schoolID.Int64)
		user.SchoolID = &schoolIDStr
	}
	if schoolName.Valid {
		user.SchoolName = &schoolName.String
	}
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found with id: %s", userID)
		}
		return nil, fmt.Errorf("failed to get user by id: %w", err)
	}
	
	return &user, nil
}

func (r *adminRepository) GetAllSchools(ctx context.Context) ([]entities.SchoolOption, error) {
	query := `
		SELECT id, name, code
		FROM schools
		ORDER BY name
	`
	
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query schools: %w", err)
	}
	defer rows.Close()
	
	var schools []entities.SchoolOption
	for rows.Next() {
		var school entities.SchoolOption
		err := rows.Scan(&school.ID, &school.Name, &school.Code)
		if err != nil {
			return nil, fmt.Errorf("failed to scan school: %w", err)
		}
		schools = append(schools, school)
	}
	
	return schools, nil
}

func (r *adminRepository) GetUserStatsByRole(ctx context.Context, schoolID *string) (map[string]int, error) {
	query := `
		SELECT role, COUNT(*) as count
		FROM users
	`
	args := []interface{}{}
	
	if schoolID != nil {
		query += " WHERE school_id = $1"
		args = append(args, *schoolID)
	}
	
	query += " GROUP BY role"
	
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query user stats: %w", err)
	}
	defer rows.Close()
	
	stats := make(map[string]int)
	for rows.Next() {
		var role string
		var count int
		err := rows.Scan(&role, &count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user stats: %w", err)
		}
		stats[role] = count
	}
	
	return stats, nil
}