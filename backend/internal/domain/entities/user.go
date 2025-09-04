package entities

import "time"

type User struct {
	ID             int64     `json:"id" db:"id"`
	FirebaseUID    string    `json:"firebase_uid" db:"firebase_uid"` // Firebase UID
	Name           string    `json:"name" db:"name"`
	Furigana       *string   `json:"furigana" db:"furigana"`
	Email          string    `json:"email" db:"email"`
	AvatarURL      *string   `json:"avatar_url" db:"avatar_url"`
	Role           string    `json:"role" db:"role"`
	SchoolID       int64     `json:"school_id" db:"school_id"`
	ClassID        *int64    `json:"class_id" db:"class_id"`
	StudentNumber  *string   `json:"student_number" db:"student_number"`
	Grade          *int      `json:"grade" db:"grade"`
	IsActive       bool      `json:"is_active" db:"is_active"`
	IsApproved     bool      `json:"is_approved" db:"is_approved"`
	UIPreferences  string    `json:"ui_preferences" db:"ui_preferences"`
	LastLoginAt    *time.Time `json:"last_login_at" db:"last_login_at"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

type School struct {
	ID              int64     `json:"id" db:"id"`
	Name            string    `json:"name" db:"name"`
	Code            string    `json:"code" db:"code"`
	EmailDomain     *string   `json:"email_domain" db:"email_domain"`
	ThemeColor      string    `json:"theme_color" db:"theme_color"`
	BackgroundColor string    `json:"background_color" db:"background_color"`
	LogoURL         *string   `json:"logo_url" db:"logo_url"`
	Address         *string   `json:"address" db:"address"`
	PhoneNumber     *string   `json:"phone_number" db:"phone_number"`
	Settings        string    `json:"settings" db:"settings"`
	IsActive        bool      `json:"is_active" db:"is_active"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type Class struct {
	ID               int64     `json:"id" db:"id"`
	SchoolID         int64     `json:"school_id" db:"school_id"`
	Name             string    `json:"name" db:"name"`
	Grade            int       `json:"grade" db:"grade"`
	AcademicYear     int       `json:"academic_year" db:"academic_year"`
	HomeroomTeacherID *int64   `json:"homeroom_teacher_id" db:"homeroom_teacher_id"`
	SubTeacherID     *int64    `json:"sub_teacher_id" db:"sub_teacher_id"`
	MaxStudents      int       `json:"max_students" db:"max_students"`
	CurrentStudents  int       `json:"current_students" db:"current_students"`
	Classroom        *string   `json:"classroom" db:"classroom"`
	ClassMotto       *string   `json:"class_motto" db:"class_motto"`
	ClassColor       string    `json:"class_color" db:"class_color"`
	IsActive         bool      `json:"is_active" db:"is_active"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}