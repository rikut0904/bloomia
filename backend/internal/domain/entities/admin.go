package entities

import "time"

type UserManagement struct {
	ID           int64     `json:"id" db:"id"`
	FirebaseUID  string    `json:"firebase_uid" db:"firebase_uid"` // Firebase UID
	Name         string    `json:"name" db:"name"`
	Email        string    `json:"email" db:"email"`
	Role         string    `json:"role" db:"role"`
	SchoolID     int64     `json:"school_id" db:"school_id"`
	SchoolName   string    `json:"school_name" db:"school_name"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	IsApproved   bool      `json:"is_approved" db:"is_approved"`
	LastLoginAt  *time.Time `json:"last_login_at" db:"last_login_at"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type UpdateUserRoleRequest struct {
	UserID   int64  `json:"user_id" validate:"required"`
	Role     string `json:"role" validate:"required,oneof=admin school_admin teacher student"`
	SchoolID *int64 `json:"school_id,omitempty"`
}

type CreateUserRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Role     string `json:"role" validate:"required,oneof=admin school_admin teacher student"`
	SchoolID int64  `json:"school_id" validate:"required"`
	Password string `json:"password" validate:"required,min=8"`
}

type UserListResponse struct {
	Users      []UserManagement `json:"users"`
	TotalCount int              `json:"total_count"`
	Page       int              `json:"page"`
	PerPage    int              `json:"per_page"`
}

type SchoolOption struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
	Code string `json:"code"`
}

// UserInvitation ユーザー招待
type UserInvitation struct {
	ID        int64     `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Email     string    `json:"email" db:"email"`
	Role      string    `json:"role" db:"role"`
	SchoolID  int64     `json:"school_id" db:"school_id"`
	Message   string    `json:"message" db:"message"`
	Status    string    `json:"status" db:"status"` // pending, accepted, expired
	Token     string    `json:"token" db:"token"`
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}