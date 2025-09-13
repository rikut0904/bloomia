package entities

import "time"

type User struct {
	ID             string    `json:"id" db:"id"`                         // UUID primary key
	FirebaseUID    string    `json:"firebase_uid" db:"firebase_uid"`     // Firebase UID
	DisplayName    string    `json:"display_name" db:"display_name"`     // User display name
	Email          string    `json:"email" db:"email"`
	Role           string    `json:"role" db:"role"`
	SchoolID       string    `json:"school_id" db:"school_id"`           // VARCHAR school ID
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

type School struct {
	ID          string    `json:"id" db:"id"`                     // UUID primary key
	SchoolID    string    `json:"school_id" db:"school_id"`       // School identifier
	SchoolName  string    `json:"school_name" db:"school_name"`   // School name
	Prefecture  *string   `json:"prefecture" db:"prefecture"`     // Prefecture
	City        *string   `json:"city" db:"city"`                 // City
	Address     *string   `json:"address" db:"address"`           // Address
	Phone       *string   `json:"phone" db:"phone"`               // Phone number
	Email       *string   `json:"email" db:"email"`               // Email
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
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