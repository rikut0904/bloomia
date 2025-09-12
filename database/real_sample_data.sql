-- Bloomia Sample Data (実際のスキーマに合わせて)

-- テスト用学校データの挿入
INSERT INTO schools (school_id, school_name, prefecture, city, address, phone, email) VALUES
('BHS001', 'Bloomia高等学校', '東京都', '新宿区', '東京都新宿区1-1-1', '03-1234-5678', 'admin@bloomia-high.ed.jp'),
('TMS002', 'テスト中学校', '大阪府', '大阪市', '大阪府大阪市2-2-2', '06-2345-6789', 'admin@test-middle.ed.jp')
ON CONFLICT (school_id) DO NOTHING;

-- テスト用ユーザーデータの挿入
INSERT INTO users (firebase_uid, display_name, email, role, school_id) VALUES
('admin-001', '管理者太郎', 'admin@bloomia.com', 'admin', 'BHS001'),
('admin-002', '管理者花子', 'admin2@bloomia.com', 'admin', 'BHS001'),
('school-admin-001', '学校管理者A', 'schooladmin1@bloomia-high.ed.jp', 'admin', 'BHS001'),
('school-admin-002', '学校管理者B', 'schooladmin2@bloomia-high.ed.jp', 'admin', 'BHS001'),
('school-admin-003', '学校管理者C', 'schooladmin3@test-middle.ed.jp', 'admin', 'TMS002'),
('teacher-001', '教員田中', 'tanaka@bloomia-high.ed.jp', 'user', 'BHS001'),
('teacher-002', '教員佐藤', 'sato@bloomia-high.ed.jp', 'user', 'BHS001'),
('teacher-003', '教員鈴木', 'suzuki@bloomia-high.ed.jp', 'user', 'BHS001'),
('teacher-004', '教員高橋', 'takahashi@test-middle.ed.jp', 'user', 'TMS002'),
('student-001', '生徒山田', 'yamada001@bloomia-high.ed.jp', 'user', 'BHS001'),
('student-002', '生徒中村', 'nakamura002@bloomia-high.ed.jp', 'user', 'BHS001'),
('student-003', '生徒伊藤', 'ito003@bloomia-high.ed.jp', 'user', 'BHS001'),
('student-004', '生徒渡辺', 'watanabe004@test-middle.ed.jp', 'user', 'TMS002'),
('student-005', '生徒小林', 'kobayashi005@test-middle.ed.jp', 'user', 'TMS002')
ON CONFLICT (firebase_uid) DO NOTHING;