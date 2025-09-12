-- Bloomia Sample Data

-- テスト用学校データの挿入
INSERT INTO schools (name, code, email_domain, theme_color, background_color, address, phone_number, principal_name, is_active) VALUES
('Bloomia高等学校', 'BHS001', 'bloomia-high.ed.jp', '#FF7F50', '#fdf8f0', '東京都新宿区1-1-1', '03-1234-5678', '田中太郎', true),
('テスト中学校', 'TMS002', 'test-middle.ed.jp', '#FF7F50', '#fdf8f0', '大阪府大阪市2-2-2', '06-2345-6789', '佐藤花子', true)
ON CONFLICT (code) DO NOTHING;

-- テスト用ユーザーデータの挿入
INSERT INTO users (firebase_uid, name, email, role, school_id, is_active, is_approved) VALUES
('admin-001', '管理者太郎', 'admin@bloomia.com', 'admin', 1, true, true),
('admin-002', '管理者花子', 'admin2@bloomia.com', 'admin', 1, true, true),
('school-admin-001', '学校管理者A', 'schooladmin1@bloomia-high.ed.jp', 'school_admin', 1, true, true),
('school-admin-002', '学校管理者B', 'schooladmin2@bloomia-high.ed.jp', 'school_admin', 1, true, true),
('school-admin-003', '学校管理者C', 'schooladmin3@test-middle.ed.jp', 'school_admin', 2, true, true),
('teacher-001', '教員田中', 'tanaka@bloomia-high.ed.jp', 'teacher', 1, true, true),
('teacher-002', '教員佐藤', 'sato@bloomia-high.ed.jp', 'teacher', 1, true, true),
('teacher-003', '教員鈴木', 'suzuki@bloomia-high.ed.jp', 'teacher', 1, true, true),
('teacher-004', '教員高橋', 'takahashi@test-middle.ed.jp', 'teacher', 2, true, true),
('student-001', '生徒山田', 'yamada001@bloomia-high.ed.jp', 'student', 1, true, true),
('student-002', '生徒中村', 'nakamura002@bloomia-high.ed.jp', 'student', 1, true, true),
('student-003', '生徒伊藤', 'ito003@bloomia-high.ed.jp', 'student', 1, true, true),
('student-004', '生徒渡辺', 'watanabe004@test-middle.ed.jp', 'student', 2, true, true),
('student-005', '生徒小林', 'kobayashi005@test-middle.ed.jp', 'student', 2, true, true)
ON CONFLICT (firebase_uid) DO NOTHING;

-- クラス情報の挿入（teachers テーブルが必要なので後で外部キーを設定）
INSERT INTO classes (school_id, name, grade, academic_year, max_students, classroom, class_color, is_active) VALUES
(1, '1年A組', 1, 2024, 40, 'A101', '#FF7F50', true),
(1, '1年B組', 1, 2024, 40, 'A102', '#20B2AA', true),
(1, '2年A組', 2, 2024, 40, 'B101', '#FFD700', true),
(1, '3年A組', 3, 2024, 40, 'C101', '#32CD32', true),
(2, '1年1組', 1, 2024, 35, '101', '#FF7F50', true),
(2, '2年1組', 2, 2024, 35, '201', '#20B2AA', true),
(2, '3年1組', 3, 2024, 35, '301', '#FFD700', true)
ON CONFLICT (school_id, name, academic_year) DO NOTHING;

-- 教員詳細情報の挿入
INSERT INTO teachers (user_id, employee_id, position, specialization, department, office_location) VALUES
((SELECT id FROM users WHERE firebase_uid = 'teacher-001'), 'EMP001', '主任教諭', ARRAY['数学', '物理'], '数学科', '職員室A-1'),
((SELECT id FROM users WHERE firebase_uid = 'teacher-002'), 'EMP002', '教諭', ARRAY['英語', '国語'], '英語科', '職員室A-2'),
((SELECT id FROM users WHERE firebase_uid = 'teacher-003'), 'EMP003', '教諭', ARRAY['理科', '化学'], '理科', '理科準備室'),
((SELECT id FROM users WHERE firebase_uid = 'teacher-004'), 'EMP004', '教諭', ARRAY['社会', '歴史'], '社会科', '職員室B-1')
ON CONFLICT (user_id) DO NOTHING;

-- 基本教科データの挿入
INSERT INTO subjects (name, code, color_code, icon_name, category, sort_order, is_active) VALUES
('数学', 'MATH', '#FF6B6B', '🔢', 'main', 1, true),
('英語', 'ENG', '#4ECDC4', '🌍', 'main', 2, true),
('国語', 'JPN', '#FECA57', '📝', 'main', 3, true),
('理科', 'SCI', '#96CEB4', '🔬', 'main', 4, true),
('社会', 'SOC', '#DDA0DD', '🌏', 'main', 5, true),
('体育', 'PE', '#FF7F50', '⚽', 'main', 6, true),
('音楽', 'MUS', '#87CEEB', '🎵', 'arts', 7, true),
('美術', 'ART', '#FFB6C1', '🎨', 'arts', 8, true),
('技術・家庭', 'TECH', '#98FB98', '🔧', 'practical', 9, true)
ON CONFLICT (code) DO NOTHING;

-- ユーザーにクラスを割り当て
UPDATE users SET class_id = (SELECT id FROM classes WHERE school_id = 1 AND name = '1年A組') 
WHERE firebase_uid IN ('student-001', 'student-002');

UPDATE users SET class_id = (SELECT id FROM classes WHERE school_id = 2 AND name = '1年1組') 
WHERE firebase_uid IN ('student-004', 'student-005');

UPDATE users SET class_id = (SELECT id FROM classes WHERE school_id = 1 AND name = '2年A組') 
WHERE firebase_uid = 'student-003';