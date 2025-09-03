package entities

import "time"

type DashboardData struct {
	User          *User           `json:"user"`
	Tasks         []Task          `json:"tasks"`
	Stats         Stats           `json:"stats"`
	Notifications []Notification  `json:"notifications"`
	Schedule      []ScheduleItem  `json:"schedule"`
}

type Task struct {
	ID       int64     `json:"id" db:"id"`
	Title    string    `json:"title" db:"title"`
	Type     string    `json:"type" db:"type"`
	Priority string    `json:"priority" db:"priority"`
	DueDate  *time.Time `json:"due_date" db:"due_date"`
	UserID   int64     `json:"user_id" db:"user_id"`
	SchoolID int64     `json:"school_id" db:"school_id"`
}

type Stats struct {
	AssignmentsPending  int     `json:"assignments_pending"`
	AssignmentsCompleted int     `json:"assignments_completed"`
	AttendanceRate      float64 `json:"attendance_rate"`
	Points              int     `json:"points"`
	Rank                *int    `json:"rank,omitempty"`
}

type Notification struct {
	ID        int64     `json:"id" db:"id"`
	Title     string    `json:"title" db:"title"`
	Message   string    `json:"message" db:"message"`
	Type      string    `json:"type" db:"type"`
	UserID    int64     `json:"user_id" db:"user_id"`
	SchoolID  int64     `json:"school_id" db:"school_id"`
	IsRead    bool      `json:"is_read" db:"is_read"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type ScheduleItem struct {
	Period    int    `json:"period"`
	Subject   string `json:"subject"`
	Teacher   string `json:"teacher"`
	Classroom string `json:"classroom"`
}