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
        SELECT id, firebase_uid, name as display_name, email, role, school_id::text as school_id, created_at, updated_at
        FROM users 
        WHERE firebase_uid = $1
    `
	
	var user entities.User
	err := r.db.QueryRowContext(ctx, query, uid).Scan(
		&user.ID,
		&user.FirebaseUID,
		&user.DisplayName,
		&user.Email,
		&user.Role,
		&user.SchoolID,
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
        SELECT id, firebase_uid, name as display_name, email, role, school_id::text as school_id, created_at, updated_at
        FROM users 
        WHERE email = $1
    `
	
	var user entities.User
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.FirebaseUID,
		&user.DisplayName,
		&user.Email,
		&user.Role,
		&user.SchoolID,
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
        INSERT INTO users (firebase_uid, name, email, role, school_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5::bigint, NOW(), NOW())
        RETURNING id, created_at, updated_at
    `

	err := r.db.QueryRowContext(ctx, query,
		user.FirebaseUID,
		user.DisplayName,
		user.Email,
		user.Role,
		user.SchoolID,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *userRepository) Update(ctx context.Context, user *entities.User) error {
	query := `
		UPDATE users 
        SET name = $2, email = $3, role = $4, school_id = $5::bigint, updated_at = NOW()
        WHERE firebase_uid = $1
        RETURNING updated_at
    `

	err := r.db.QueryRowContext(ctx, query,
		user.FirebaseUID,
		user.DisplayName,
		user.Email,
		user.Role,
		user.SchoolID,
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
		SET updated_at = NOW() 
		WHERE firebase_uid = $1
	`

	_, err := r.db.ExecContext(ctx, query, uid)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	return nil
}

func (r *userRepository) FindSchoolByID(ctx context.Context, schoolID int64) (*entities.School, error) {
	// This method will be implemented when school management is needed
	// For now, return a basic implementation that works with the current schema
	return nil, fmt.Errorf("school management not yet implemented for current schema")
}

func (r *userRepository) FindSchoolByEmailDomain(ctx context.Context, domain string) (*entities.School, error) {
	// This method will be implemented when school management is needed
	return nil, fmt.Errorf("school management not yet implemented for current schema")
}

func (r *userRepository) FindClassByID(ctx context.Context, classID int64) (*entities.Class, error) {
	// This method will be implemented when class management is needed
	return nil, fmt.Errorf("class management not yet implemented for current schema")
}

// GetUserByFirebaseUID Firebase UIDでユーザーを取得
func (r *userRepository) GetUserByFirebaseUID(ctx context.Context, firebaseUID string) (*entities.User, error) {
    query := `
        SELECT id, firebase_uid, name as display_name, email, role, school_id::text as school_id, created_at, updated_at
        FROM users 
        WHERE firebase_uid = $1
    `
	
	var user entities.User
	err := r.db.QueryRowContext(ctx, query, firebaseUID).Scan(
		&user.ID,
		&user.FirebaseUID,
		&user.DisplayName,
		&user.Email,
		&user.Role,
		&user.SchoolID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found with firebase uid: %s", firebaseUID)
		}
		return nil, fmt.Errorf("failed to find user by firebase uid: %w", err)
	}

	return &user, nil
}

// CreateUser ユーザーを作成（戻り値として作成されたユーザーを返す）
func (r *userRepository) CreateUser(ctx context.Context, user *entities.User) (*entities.User, error) {
    query := `
        INSERT INTO users (firebase_uid, name, email, role, school_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5::bigint, NOW(), NOW())
        RETURNING id, created_at, updated_at
    `

	err := r.db.QueryRowContext(ctx, query,
		user.FirebaseUID,
		user.DisplayName,
		user.Email,
		user.Role,
		user.SchoolID,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// UpdateUser ユーザーを更新（戻り値として更新されたユーザーを返す）
func (r *userRepository) UpdateUser(ctx context.Context, userID string, updateData entities.User) (*entities.User, error) {
    query := `
        UPDATE users 
        SET name = $2, email = $3, role = $4, school_id = $5::bigint, updated_at = NOW()
        WHERE id = $1
        RETURNING id, firebase_uid, name as display_name, email, role, school_id::text as school_id, created_at, updated_at
    `

	var user entities.User
	err := r.db.QueryRowContext(ctx, query,
		userID,
		updateData.DisplayName,
		updateData.Email,
		updateData.Role,
		updateData.SchoolID,
	).Scan(
		&user.ID,
		&user.FirebaseUID,
		&user.DisplayName,
		&user.Email,
		&user.Role,
		&user.SchoolID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found for update: %s", userID)
		}
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return &user, nil
}
