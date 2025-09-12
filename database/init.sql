-- Bloomia Database Initialization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 学校情報テーブル
CREATE TABLE IF NOT EXISTS schools (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    email_domain TEXT UNIQUE,
    theme_color TEXT DEFAULT '#FF7F50',
    background_color TEXT DEFAULT '#fdf8f0',
    logo_url TEXT,
    address TEXT,
    phone_number TEXT,
    principal_name TEXT,
    vice_principal_name TEXT,
    student_capacity INTEGER DEFAULT 500,
    settings JSONB DEFAULT '{"theme": "coral", "background": "#fdf8f0"}',
    academic_year_start INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 基本ユーザー情報テーブル
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,  -- Firebase UID
    name TEXT NOT NULL,
    furigana TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    school_id BIGINT NOT NULL REFERENCES schools(id),
    class_id BIGINT REFERENCES classes(id),
    student_number TEXT,
    grade INTEGER CHECK (grade BETWEEN 1 AND 3),
    guardian_name_encrypted TEXT,
    guardian_phone_encrypted TEXT,
    guardian_email_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    ui_preferences JSONB DEFAULT '{"theme": "coral", "background": "#fdf8f0"}',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(school_id, student_number),
    CHECK (role IN ('admin', 'school_admin', 'teacher', 'student'))
);

-- クラス情報テーブル
CREATE TABLE IF NOT EXISTS classes (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id),
    name TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 3),
    academic_year INTEGER NOT NULL,
    homeroom_teacher_id BIGINT,
    sub_teacher_id BIGINT,
    max_students INTEGER DEFAULT 40,
    current_students INTEGER DEFAULT 0,
    classroom TEXT,
    class_motto TEXT,
    class_color TEXT DEFAULT '#FF7F50',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(school_id, name, academic_year)
);

-- 教員詳細情報テーブル
CREATE TABLE IF NOT EXISTS teachers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    employee_id TEXT UNIQUE NOT NULL,
    position TEXT NOT NULL,
    specialization TEXT[],
    homeroom_class_id BIGINT REFERENCES classes(id),
    hire_date DATE,
    department TEXT,
    office_location TEXT,
    extension_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 外部キー制約を追加（循環参照を避けるため、後で追加）
ALTER TABLE classes 
ADD CONSTRAINT fk_homeroom_teacher 
FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id);

ALTER TABLE classes 
ADD CONSTRAINT fk_sub_teacher 
FOREIGN KEY (sub_teacher_id) REFERENCES teachers(id);

ALTER TABLE users
ADD CONSTRAINT fk_class_id 
FOREIGN KEY (class_id) REFERENCES classes(id);

-- 教科テーブル
CREATE TABLE IF NOT EXISTS subjects (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    color_code TEXT DEFAULT '#FF7F50',
    icon_name TEXT,
    description TEXT,
    category TEXT DEFAULT 'main',
    credit_hours INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 授業テーブル
CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    class_id BIGINT NOT NULL REFERENCES classes(id),
    teacher_id BIGINT NOT NULL REFERENCES teachers(id),
    course_name TEXT NOT NULL,
    description TEXT,
    academic_year INTEGER NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 3),
    weekly_hours INTEGER DEFAULT 1,
    classroom TEXT,
    textbook TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(subject_id, class_id, academic_year, semester)
);

-- 教材テーブル
CREATE TABLE IF NOT EXISTS materials (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id),
    title TEXT NOT NULL,
    description TEXT,
    material_type TEXT NOT NULL CHECK (material_type IN ('pdf', 'video', 'image', 'url', 'text')),
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    thumbnail_url TEXT,
    content_text TEXT,
    difficulty_level TEXT DEFAULT 'medium',
    estimated_minutes INTEGER,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 課題テーブル
CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id),
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('text', 'file', 'choice', 'mixed')),
    max_points INTEGER DEFAULT 100,
    min_passing_points INTEGER DEFAULT 60,
    difficulty_level TEXT DEFAULT 'medium',
    estimated_minutes INTEGER,
    file_size_limit BIGINT DEFAULT 10485760,
    allowed_file_types TEXT[],
    rubric JSONB,
    due_date TIMESTAMPTZ,
    late_submission_penalty DECIMAL(3,2) DEFAULT 0.1,
    allow_late_submission BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_by BIGINT NOT NULL REFERENCES teachers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 提出物テーブル
CREATE TABLE IF NOT EXISTS submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id),
    student_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    points INTEGER,
    feedback TEXT,
    status TEXT DEFAULT 'submitted',
    is_late BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    graded_by BIGINT REFERENCES teachers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(assignment_id, student_id)
);

-- 成績テーブル
CREATE TABLE IF NOT EXISTS grades (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    assignment_id BIGINT REFERENCES assignments(id),
    grade_type TEXT NOT NULL,
    points INTEGER NOT NULL,
    max_points INTEGER NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS ((points::DECIMAL / max_points) * 100) STORED,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 3),
    academic_year INTEGER NOT NULL,
    graded_by BIGINT NOT NULL REFERENCES teachers(id),
    graded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 出席テーブル
CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    attendance_date DATE NOT NULL,
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 6),
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'sick', 'official')),
    reason TEXT,
    recorded_by BIGINT NOT NULL REFERENCES teachers(id),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(student_id, course_id, attendance_date, period)
);

-- チャットルームテーブル（学校単位制約）
CREATE TABLE IF NOT EXISTS chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id),
    name TEXT NOT NULL,
    room_type TEXT NOT NULL CHECK (room_type IN ('class', 'subject', 'grade', 'school', 'direct', 'club')),
    description TEXT,
    room_color TEXT DEFAULT '#FF7F50',
    class_id BIGINT REFERENCES classes(id),
    course_id BIGINT REFERENCES courses(id),
    target_grade INTEGER CHECK (target_grade BETWEEN 1 AND 3),
    is_private BOOLEAN DEFAULT false,
    max_participants INTEGER DEFAULT 100,
    allow_file_upload BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(school_id, name, room_type)
);

-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id),
    sender_id BIGINT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    file_url TEXT,
    file_name TEXT,
    reply_to BIGINT REFERENCES messages(id),
    mention_users BIGINT[],
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ホワイトボードセッションテーブル
CREATE TABLE IF NOT EXISTS whiteboard_sessions (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    title TEXT NOT NULL,
    session_type TEXT DEFAULT 'lesson',
    presenter_id BIGINT NOT NULL REFERENCES teachers(id),
    canvas_data JSONB DEFAULT '{}',
    background_color TEXT DEFAULT '#fdf8f0',
    is_active BOOLEAN DEFAULT false,
    participant_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

-- 学習ノートテーブル
CREATE TABLE IF NOT EXISTS learning_notes (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    course_id BIGINT REFERENCES courses(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    note_type TEXT DEFAULT 'personal',
    cover_color TEXT DEFAULT '#FF7F50',
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    shared_with_teacher BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    word_count INTEGER DEFAULT 0,
    related_assignment_id BIGINT REFERENCES assignments(id),
    related_material_id BIGINT REFERENCES materials(id),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 校務分掌業務テーブル
CREATE TABLE IF NOT EXISTS administrative_tasks (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    assigned_to BIGINT NOT NULL REFERENCES teachers(id),
    collaborators BIGINT[],
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0,
    due_date TIMESTAMPTZ,
    estimated_hours DECIMAL(4,2),
    actual_hours DECIMAL(4,2),
    requires_approval BOOLEAN DEFAULT false,
    approved_by BIGINT REFERENCES teachers(id),
    created_by BIGINT NOT NULL REFERENCES teachers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会議管理テーブル
CREATE TABLE IF NOT EXISTS meetings (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id),
    title TEXT NOT NULL,
    meeting_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    organizer_id BIGINT NOT NULL REFERENCES teachers(id),
    status TEXT DEFAULT 'scheduled',
    agenda JSONB,
    minutes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ゲーミフィケーション - ユーザーポイントテーブル
CREATE TABLE IF NOT EXISTS user_points (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    points INTEGER NOT NULL,
    point_type TEXT NOT NULL,
    source_id BIGINT,
    description TEXT,
    semester INTEGER NOT NULL,
    academic_year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ゲーミフィケーション - 実績テーブル
CREATE TABLE IF NOT EXISTS achievements (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    icon_color TEXT DEFAULT '#FF7F50',
    background_color TEXT DEFAULT '#fdf8f0',
    category TEXT NOT NULL,
    rarity TEXT DEFAULT 'common',
    points_reward INTEGER DEFAULT 0,
    conditions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザー招待テーブル
CREATE TABLE IF NOT EXISTS user_invitations (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    school_id BIGINT NOT NULL REFERENCES schools(id),
    message TEXT,
    status TEXT DEFAULT 'pending',
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_class_id ON courses(class_id);
CREATE INDEX IF NOT EXISTS idx_materials_course_id ON materials(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_school_id ON chat_rooms(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_learning_notes_student_id ON learning_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_administrative_tasks_school_id ON administrative_tasks(school_id);
CREATE INDEX IF NOT EXISTS idx_meetings_school_id ON meetings(school_id);

-- Row Level Security (RLS) 有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成（基本的な学校別分離）
CREATE POLICY school_isolation_users ON users
    FOR ALL TO authenticated
    USING (
        CASE 
            WHEN current_setting('app.current_user_role', true) = 'admin' THEN true
            ELSE school_id = current_setting('app.current_user_school_id', true)::bigint
        END
    );

CREATE POLICY school_isolation_classes ON classes
    FOR ALL TO authenticated
    USING (
        CASE 
            WHEN current_setting('app.current_user_role', true) = 'admin' THEN true
            ELSE school_id = current_setting('app.current_user_school_id', true)::bigint
        END
    );

-- データ保持期限管理テーブル
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    retention_days INTEGER NOT NULL,
    auto_delete BOOLEAN DEFAULT true,
    last_cleanup TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- データ保持ポリシーの初期設定
INSERT INTO data_retention_policies (table_name, data_type, retention_days, auto_delete) VALUES
('messages', 'chat_log', 365, true),
('grades', 'student_record', 1825, true),  -- 5年
('system_logs', 'system_log', 180, true),  -- 6ヶ月
('learning_notes', 'student_notes', 1095, true)  -- 3年
ON CONFLICT DO NOTHING;