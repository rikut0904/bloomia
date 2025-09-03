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
    uid TEXT UNIQUE NOT NULL,           -- Auth0 ユーザーID
    name TEXT NOT NULL,
    furigana TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    school_id BIGINT NOT NULL REFERENCES schools(id),
    class_id BIGINT,
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

-- 初期データ挿入
INSERT INTO schools (id, name, code, email_domain, theme_color, background_color) VALUES 
(1, 'テスト中学校', 'test-junior-high', 'test.edu.jp', '#FF7F50', '#fdf8f0')
ON CONFLICT (id) DO NOTHING;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);

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