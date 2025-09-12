-- Bloomia Enhanced PostgreSQL Database Schema
-- Firebase Authentication + PostgreSQL Database Architecture
-- Extended schema for admin management system

-- Drop existing constraints and tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Schools table with complete information
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    school_id VARCHAR(50) UNIQUE NOT NULL DEFAULT CONCAT('SCH', LPAD(nextval('schools_id_seq')::text, 6, '0')),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('elementary', 'junior_high', 'high_school', 'university', 'vocational', 'other')),
    prefecture VARCHAR(50),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    principal_name VARCHAR(255),
    principal_email VARCHAR(255),
    description TEXT,
    student_count INTEGER DEFAULT 0,
    teacher_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table with admin role system
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(20) UNIQUE NOT NULL DEFAULT CONCAT('USR', LPAD(nextval('users_id_seq')::text, 6, '0')),
    firebase_uid VARCHAR(128) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'school_admin', 'teacher', 'student')),
    school_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Foreign key constraint
    CONSTRAINT fk_users_school_id 
        FOREIGN KEY (school_id) REFERENCES schools(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- User profiles table for additional information
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Foreign key constraint
    CONSTRAINT fk_user_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_approved ON users(is_approved);
CREATE INDEX idx_schools_id ON schools(id);
CREATE INDEX idx_schools_is_active ON schools(is_active);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at 
    BEFORE UPDATE ON schools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO schools (name, type, prefecture, city, address, phone, email, principal_name, principal_email, student_count, teacher_count) VALUES
('サンプル高等学校', 'high_school', '東京都', '渋谷区', '神南1-2-3', '03-1234-5678', 'info@sample-high.ac.jp', '田中太郎', 'tanaka@sample-high.ac.jp', 1200, 80),
('テスト中学校', 'junior_high', '神奈川県', '横浜市', '青葉台2-1-1', '045-123-4567', 'info@test-junior.ac.jp', '佐藤花子', 'sato@test-junior.ac.jp', 800, 50),
('花園小学校', 'elementary', '大阪府', '大阪市', '花園町3-4-5', '06-123-4567', 'info@hanazono-elem.ac.jp', '鈴木一郎', 'suzuki@hanazono-elem.ac.jp', 600, 35);

INSERT INTO users (name, email, role, school_id, is_active, is_approved) VALUES
('システム管理者', 'admin@bloomia.com', 'admin', NULL, true, true),
('佐藤花子', 'sato@sample-high.ac.jp', 'school_admin', 1, true, true),
('鈴木一郎', 'suzuki@sample-high.ac.jp', 'teacher', 1, true, true),
('高橋美咲', 'takahashi@student.sample-high.ac.jp', 'student', 1, true, false),
('山田太郎', 'yamada@test-junior.ac.jp', 'teacher', 2, true, true);

INSERT INTO user_profiles (user_id, phone, department, position, bio) VALUES
(2, '090-1234-5678', '教務部', '教務主任', '学校運営に10年従事。生徒の成長をサポートしています。'),
(3, '090-2345-6789', '数学科', '主任教諭', '数学教育に20年従事。論理的思考力の向上を目指しています。'),
(4, '090-3456-7890', NULL, NULL, '数学と物理が好きです。将来はエンジニアになりたいです。'),
(5, '090-4567-8901', '英語科', '教諭', '英語教育を通じて国際的な視野を育てています。');