# Bloomia - 中学校向け統合学習・公務支援システム

## 📋 システム概要

### プロジェクトコンセプト
Bloomiaは中学生の「学びたい」という気持ちを育み、教師の教育活動と公務業務を統合的に支援するプラットフォームです。生徒一人ひとりの学習意欲を自然と引き出し、教師の教育活動と公務業務を一つのシステムで効率化し、学校全体のコミュニケーションを活性化します。

### 対象・規模
- **主要対象**: 中学校（1-3年生）、中学校教諭
- **導入形態**: 教育委員会レベルでの一括導入
- **想定規模**: 1校450名（生徒420名 + 教職員30名）
- **同時接続**: 最大500ユーザー（授業時間中300-400ユーザー）

---

## 🏗️ システムアーキテクチャ

### 技術スタック

**フロントエンド（Vercel）**
- Next.js 15（App Router）+ React 18
- TypeScript + Tailwind CSS 4
- Auth0 Next.js SDK
- PWA対応（next-pwa）

**バックエンド（Railway統合管理）**
- Go 1.24 + Chi Router
- PostgreSQL 14（メインDB）
- Redis 7（キャッシュ・セッション）
- Railway Volumes（ファイルストレージ 50GB）

**外部サービス**
- Auth0（認証・認可）
- Vercel（フロントエンド配信）
- Railway（バックエンドインフラ）

**アーキテクチャ原則**
- Clean Architecture（ドメイン駆動設計）
- API First（フロントエンド独立設計）
- マルチテナント（学校別完全データ分離）
- スケーラブル（水平スケーリング対応）

---

## 🗂️ ディレクトリ構造

### バックエンド（Go + Clean Architecture）
```
backend/
├── cmd/server/              # エントリーポイント
├── internal/
│   ├── domain/              # ドメイン層
│   │   ├── entities/        # User, Course, Assignment等
│   │   ├── repositories/    # リポジトリIF
│   │   └── services/        # ドメインサービス
│   ├── usecase/             # ユースケース層
│   │   ├── auth/           # 認証
│   │   ├── lms/            # 学習管理
│   │   ├── chat/           # コミュニケーション
│   │   ├── whiteboard/     # ホワイトボード
│   │   ├── notes/          # ノート機能
│   │   └── admin/          # 公務支援
│   ├── infrastructure/      # インフラ層
│   │   ├── database/       # PostgreSQL
│   │   ├── cache/          # Redis
│   │   ├── storage/        # Railway Volumes
│   │   └── auth/           # Auth0
│   └── interface/           # インターフェース層
│       ├── http/           # HTTPハンドラー
│       ├── websocket/      # WebSocket
│       └── middleware/     # 認証・認可
├── migrations/              # DBマイグレーション
└── docker-compose.yml       # ローカル開発用
```

### フロントエンド（Next.js App Router）
```
frontend/
├── app/                     # App Router
│   ├── (public)/           # 公開ページグループ
│   │   ├── page.tsx        # ホームページ
│   │   ├── about/          # サービス紹介
│   │   ├── features/       # 機能詳細
│   │   ├── contact/        # お問い合わせ
│   │   └── login/          # ログイン
│   ├── home/               # 認証後メインアプリ
│   │   ├── dashboard/      # ダッシュボード
│   │   │   ├── student/    # 生徒用
│   │   │   └── teacher/    # 教師用
│   │   ├── materials/      # 教材管理
│   │   ├── assignments/    # 課題管理
│   │   ├── grades/        # 成績管理
│   │   ├── chat/          # コミュニケーション
│   │   ├── notes/         # ノート機能
│   │   ├── whiteboard/    # ホワイトボード
│   │   ├── schedule/      # 時間割
│   │   ├── attendance/    # 出席管理
│   │   ├── gamification/  # ゲーミフィケーション
│   │   └── layout.tsx     # メインレイアウト
│   ├── admin/             # 管理者専用
│   │   ├── dashboard/     # 管理ダッシュボード
│   │   ├── users/         # ユーザー管理
│   │   ├── schools/       # 学校管理
│   │   ├── analytics/     # 統計分析
│   │   ├── system/        # システム管理
│   │   └── layout.tsx     # 管理レイアウト
│   ├── help/              # ヘルプページ
│   └── api/               # API Routes
├── components/             # 共通コンポーネント
│   ├── ui/                # 基本UIコンポーネント
│   ├── forms/             # フォームコンポーネント
│   ├── charts/            # グラフコンポーネント
│   └── layout/            # レイアウトコンポーネント
├── styles/                # スタイル
│   ├── globals.css        # グローバルCSS
│   ├── themes.css         # コーラルテーマ
│   └── components.css     # コンポーネントスタイル
├── lib/                   # ユーティリティ
└── public/                # 静的ファイル
```

---

## 🔐 権限管理

### 権限階層
```
1. システム管理者（admin）
   └─ 全学校・全機能アクセス

2. 学校管理者（school_admin）
   └─ 自校内・全機能アクセス

3. 教員（teacher）
   └─ 自校ユーザー管理 + 担当教科 + 自校公務フルアクセス

4. 生徒（student）
   └─ 自分のデータ + 自校コミュニケーション
```

### 機能別権限マトリックス

| 機能カテゴリ | 管理者 | 学校管理者 | 教員 | 生徒 |
|-------------|-------|------------|------|------|
| **学校管理** | 全校 | 自校 | 閲覧のみ | なし |
| **ユーザー管理** | 全校 | 自校 | 自校 | 自分のみ |
| **教材管理** | 全校 | 自校 | 担当教科 | 閲覧のみ |
| **課題管理** | 全校 | 自校 | 担当教科 | 提出のみ |
| **成績管理** | 全校 | 自校 | 担当生徒 | 自分のみ |
| **チャット** | 全校 | 自校 | 自校 | 自校 |
| **公務機能** | 全校 | 自校 | 自校 | なし |
| **ホワイトボード** | 全校 | 自校 | 管理可 | 参加のみ |
| **ノート** | 全校閲覧 | 自校閲覧 | 担当生徒閲覧 | 自分のみ |

---

## 🗄️ データベース設計

### 基本構造テーブル
```sql
-- 学校情報
CREATE TABLE schools (
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

-- 基本ユーザー情報
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uid TEXT UNIQUE NOT NULL,           -- Auth0 ユーザーID
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

-- 教員詳細情報
CREATE TABLE teachers (
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

-- クラス情報
CREATE TABLE classes (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id),
    name TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 3),
    academic_year INTEGER NOT NULL,
    homeroom_teacher_id BIGINT REFERENCES teachers(id),
    sub_teacher_id BIGINT REFERENCES teachers(id),
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

-- 教科
CREATE TABLE subjects (
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

-- 授業
CREATE TABLE courses (
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

-- 教材
CREATE TABLE materials (
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

-- 課題
CREATE TABLE assignments (
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

-- 提出物
CREATE TABLE submissions (
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

-- 成績
CREATE TABLE grades (
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

-- 出席
CREATE TABLE attendance (
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

-- チャットルーム（学校単位制約）
CREATE TABLE chat_rooms (
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

-- メッセージ
CREATE TABLE messages (
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

-- ホワイトボードセッション
CREATE TABLE whiteboard_sessions (
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

-- 学習ノート
CREATE TABLE learning_notes (
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

-- 校務分掌業務
CREATE TABLE administrative_tasks (
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

-- 会議管理
CREATE TABLE meetings (
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

-- ゲーミフィケーション
CREATE TABLE user_points (
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

CREATE TABLE achievements (
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
```

---

## 🌐 環境・デプロイ設計

### 環境構成
```
開発環境（Development）
├── Next.js dev server (localhost:3000)
├── Go server (localhost:8080)
├── PostgreSQL (localhost:5432)
└── Redis (localhost:6379)

ステージング環境
├── Vercel (staging.bloomia.com)
├── Railway API (api-staging.railway.app)
├── Railway PostgreSQL
└── Railway Redis

本番環境
├── Vercel (bloomia.com)
├── Railway API (api.railway.app)
├── Railway PostgreSQL
└── Railway Redis
```

### 環境変数設計
```bash
# 共通設定
NODE_ENV=development|staging|production
APP_ENV=dev|staging|prod

# テーマ設定
DEFAULT_THEME_COLOR=#FF7F50
DEFAULT_BACKGROUND_COLOR=#fdf8f0
THEME_NAME=coral

# データベース
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# 認証（Auth0）
AUTH0_DOMAIN=bloomia-dev.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://api.bloomia.com

# アプリケーション
API_BASE_URL=http://localhost:8080|https://api.bloomia.com
FRONTEND_URL=http://localhost:3000|https://bloomia.com
WEBSOCKET_URL=ws://localhost:8080/ws|wss://api.bloomia.com/ws

# Railway設定
RAILWAY_STORAGE_PATH=/app/storage
PORT=8080

# セキュリティ
ENCRYPTION_KEY=your-32-char-key
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# 機能フラグ
ENABLE_WHITEBOARD=true
ENABLE_NOTES=true
ENABLE_GAMIFICATION=true
CORAL_THEME_ONLY=true
```

---

## 🔌 API設計

### RESTful API エンドポイント

#### 認証・ユーザー管理
```http
POST   /api/v1/auth/sync              # Auth0同期
GET    /api/v1/users                  # ユーザー一覧（教員：自校、管理者：全校）
POST   /api/v1/users/students         # 生徒作成（教員権限）
PUT    /api/v1/users/{id}             # ユーザー更新
GET    /api/v1/users/{id}/permissions # ユーザー権限取得
```

#### 学習管理
```http
GET    /api/v1/courses/{id}/materials # 教材一覧
POST   /api/v1/materials              # 教材作成
PUT    /api/v1/materials/{id}         # 教材更新
DELETE /api/v1/materials/{id}         # 教材削除

GET    /api/v1/assignments            # 課題一覧
POST   /api/v1/assignments            # 課題作成
POST   /api/v1/assignments/{id}/submissions # 提出
PUT    /api/v1/submissions/{id}/grade # 採点

GET    /api/v1/students/{id}/grades   # 成績取得
POST   /api/v1/grades                 # 成績入力
GET    /api/v1/attendance             # 出席確認
POST   /api/v1/attendance             # 出席登録
```

#### コミュニケーション（学校単位）
```http
GET    /api/v1/chat/school-rooms      # 学校チャットルーム一覧
POST   /api/v1/chat/school-rooms      # ルーム作成（教員以上）
GET    /api/v1/chat/rooms/{id}/messages # メッセージ取得
POST   /api/v1/chat/rooms/{id}/messages # メッセージ送信
GET    /api/v1/notifications          # 通知一覧
```

#### ホワイトボード
```http
POST   /api/v1/whiteboard/sessions    # セッション開始（教員）
GET    /api/v1/whiteboard/sessions/{id} # セッション情報
POST   /api/v1/whiteboard/sessions/{id}/join # セッション参加
WebSocket: /ws/whiteboard             # リアルタイム描画
```

#### ノート機能
```http
GET    /api/v1/notes                  # ノート一覧
POST   /api/v1/notes                  # ノート作成
PUT    /api/v1/notes/{id}             # ノート更新
DELETE /api/v1/notes/{id}             # ノート削除
POST   /api/v1/notes/{id}/share       # ノート共有
GET    /api/v1/notes/templates        # テンプレート一覧
```

#### 公務支援（自校フルアクセス）
```http
GET    /api/v1/admin/tasks            # 校務業務一覧（教員：自校全体）
POST   /api/v1/admin/tasks            # 業務作成
PUT    /api/v1/admin/tasks/{id}       # 業務更新
GET    /api/v1/meetings               # 会議一覧
POST   /api/v1/meetings               # 会議作成
```

### ファイル管理
```http
POST   /api/v1/files/upload/{type}    # ファイルアップロード
GET    /api/v1/files/{id}             # ファイル取得
DELETE /api/v1/files/{id}             # ファイル削除

# Railway Volumes構造
/app/storage/
├── materials/{school_id}/{subject}/
├── submissions/{school_id}/{assignment_id}/{student_id}/
├── notes/{school_id}/{student_id}/
├── whiteboard/{school_id}/{session_id}/
├── documents/{school_id}/{category}/
├── avatars/{user_id}/
└── system/logs/
```

---

## 🎨 UI/UX設計

### デザインシステム
```css
:root {
  /* メインカラー（コーラルオレンジ） */
  --primary: #FF7F50;
  --primary-light: #FFB07A;
  --primary-dark: #E55A2B;
  
  /* セカンダリカラー（シーグリーン） */
  --secondary: #20B2AA;
  --secondary-light: #48D1CC;
  --secondary-dark: #008B8B;
  
  /* アクセントカラー */
  --accent: #FFD700;
  --accent-light: #FFEC8C;
  --accent-dark: #DAA520;
  
  /* 機能別カラー */
  --success: #32CD32;
  --warning: #FFA500;
  --error: #DC143C;
  --info: #4682B4;
  
  /* 背景・テキスト */
  --background: #fdf8f0;      /* メイン背景色 */
  --surface: #FFFFFF;         /* カード背景 */
  --text-primary: #2F1B14;    /* メインテキスト */
  --text-secondary: #8B4513;  /* サブテキスト */
  --border: #DEB887;          /* ボーダー */
  --shadow: rgba(255, 127, 80, 0.2); /* シャドウ */
}

/* コンポーネントスタイル */
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px var(--shadow);
}

.card {
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(255, 127, 80, 0.1);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.dashboard-tile {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.page-background {
  background-color: var(--background);
  min-height: 100vh;
}
```

### レスポンシブ対応
```
デスクトップ（1024px+）: 4×3 大型タイルグリッド
タブレット（768-1023px）: 3×4 中型タイルグリッド  
スマートフォン（~767px）: 2×6 小型タイルグリッド

共通設計:
- タッチ操作対応（44px以上のタップターゲット）
- 読みやすいフォントサイズ（16px以上）
- 色覚多様性対応（形状・アイコンでの補助情報）
- キーボードナビゲーション対応
```

---

## 🗺️ サイトマップ

### URL構造
```
/ (ホームページ・サービス紹介)
/login (Auth0ログイン)
/home/* (メインアプリケーション)
/admin/* (管理者専用)
/help (ヘルプ・サポート)
```

### 主要ページ構成

#### 生徒エリア（/home/*）
```
/home/dashboard                       # ダッシュボード
/home/materials                       # 教材一覧
/home/assignments                     # 課題一覧
/home/assignments/todo                # 未提出課題
/home/assignments/{id}                # 課題詳細・提出
/home/grades                          # 成績確認
/home/attendance                      # 出席確認
/home/chat                           # チャット（学校単位）
/home/chat/class                     # クラスチャット
/home/chat/grade                     # 学年チャット
/home/chat/subject/{subject}         # 教科別チャット
/home/notes                          # 学習ノート
/home/notes/{id}                     # ノート編集
/home/whiteboard                     # ホワイトボード参加
/home/schedule                       # 時間割
/home/gamification                   # ポイント・ランキング
/home/notifications                  # 通知
/home/profile                        # プロフィール
```

#### 教師エリア（/home/teacher/*）
```
/home/teacher/dashboard               # 教師ダッシュボード
/home/teacher/users                   # ユーザー管理（自校）
/home/teacher/users/students          # 生徒管理
/home/teacher/users/register          # 生徒登録
/home/teacher/materials               # 教材管理
/home/teacher/assignments             # 課題管理
/home/teacher/grades                  # 成績管理
/home/teacher/attendance              # 出席管理
/home/teacher/students                # 生徒詳細管理
/home/teacher/whiteboard              # ホワイトボード管理
/home/teacher/admin-tasks             # 校務業務（自校フルアクセス）
/home/teacher/meetings                # 会議管理
/home/teacher/documents               # 文書管理
/home/teacher/applications            # 申請業務
/home/teacher/parents                 # 保護者連携
/home/teacher/analytics               # 統計分析
```

#### 管理者エリア（/admin/*）
```
/admin/dashboard                      # 管理ダッシュボード
/admin/schools                        # 学校管理
/admin/schools/{id}/settings          # 学校別設定
/admin/users                          # 全ユーザー管理
/admin/users/approvals                # ユーザー承認
/admin/analytics                      # 全体統計分析
/admin/system                         # システム管理
/admin/system/settings                # システム設定
/admin/audit                          # 監査ログ
/admin/maintenance                    # メンテナンス
```

---

## 🔒 セキュリティ・プライバシー設計

### 個人情報保護法対応
```sql
-- データ保存期限管理
CREATE TABLE data_retention_policies (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    retention_days INTEGER NOT NULL,
    auto_delete BOOLEAN DEFAULT true,
    last_cleanup TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO data_retention_policies VALUES
(1, 'messages', 'chat_log', 365, true, NOW()),
(2, 'grades', 'student_record', 1825, true, NOW()),
(3, 'system_logs', 'system_log', 180, true, NOW()),
(4, 'learning_notes', 'student_notes', 1095, true, NOW());

-- Row Level Security
CREATE POLICY school_data_isolation ON users
    FOR ALL TO authenticated_user
    USING (
        CASE
            WHEN get_current_user_role() = 'admin' THEN TRUE
            ELSE school_id = get_current_user_school_id()
        END
    );
```

### セキュリティヘッダー
```go
func SecurityHeaders(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-Frame-Options", "DENY")
        w.Header().Set("X-XSS-Protection", "1; mode=block")
        w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        w.Header().Set("Content-Security-Policy", "default-src 'self'")
        w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
        next.ServeHTTP(w, r)
    })
}
```

---

## 📊 監視・運用設計

### ヘルスチェック
```go
func HealthHandler(w http.ResponseWriter, r *http.Request) {
    health := HealthStatus{
        Status:      "healthy",
        Environment: os.Getenv("APP_ENV"),
        Version:     "1.0.0",
        Theme:       "coral",
        Background:  "#fdf8f0",
        Services: map[string]string{
            "database": checkDatabase(),
            "redis":    checkRedis(),
            "storage":  checkStorage(),
            "auth0":    checkAuth0(),
        },
        Timestamp: time.Now(),
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(health)
}
```

### Redis活用設計
```
キャッシュキー構造:
user:profile:{user_id}              # ユーザープロフィール（1時間）
user:permissions:{user_id}          # ユーザー権限（1時間）
school:users:{school_id}            # 学校ユーザーリスト（2時間）
class:students:{class_id}           # クラス生徒リスト（2時間）
course:materials:{course_id}        # 授業教材リスト（6時間）
assignments:active:{user_id}        # アクティブ課題（5分）
chat:rooms:{user_id}                # 参加チャットルーム（30分）
notifications:unread:{user_id}      # 未読通知（5分）
ranking:points:{class_id}           # ポイントランキング（12時間）
whiteboard:session:{session_id}     # ホワイトボードセッション（セッション中）
notes:recent:{user_id}              # 最近のノート（30分）
```

---

## 📝 新機能設計（追加要件）

### ホワイトボード機能
```go
// WebSocket実装
type WhiteboardHub struct {
    sessions   map[int64]*WhiteboardSession
    register   chan *Client
    unregister chan *Client
    broadcast  chan []byte
}

type WhiteboardEvent struct {
    Type      string      `json:"type"`
    SessionID int64       `json:"session_id"`
    UserID    int64       `json:"user_id"`
    Data      EventData   `json:"data"`
    Color     string      `json:"color"`
    Tool      string      `json:"tool"`
    Timestamp time.Time   `json:"timestamp"`
}
```

### ノート機能
```tsx
// React実装例
const NoteEditor = ({ noteId, courseId }) => {
  const [content, setContent] = useState('');
  const [coverColor, setCoverColor] = useState('#FF7F50');
  
  const coralThemeColors = [
    '#FF7F50', '#20B2AA', '#FFD700', '#32CD32',
    '#FF6B6B', '#4ECDC4', '#FECA57', '#96CEB4'
  ];
  
  return (
    <div className="h-screen flex flex-col" style={{backgroundColor: '#fdf8f0'}}>
      <NoteHeader 
        title={title}
        coverColor={coverColor}
        availableColors={coralThemeColors}
        onColorChange={setCoverColor}
      />
      <MarkdownEditor 
        content={content}
        onChange={setContent}
        theme={{
          primaryColor: coverColor,
          backgroundColor: '#FFFFFF',
          borderColor: '#DEB887'
        }}
      />
    </div>
  );
};
```

### 教員ユーザー管理
```go
// 自校生徒作成API
func CreateStudentByTeacher(w http.ResponseWriter, r *http.Request) {
    claims := r.Context().Value("user_claims").(*UserClaims)
    
    // 教員権限チェック
    if claims.Role != "teacher" && claims.Role != "school_admin" && claims.Role != "admin" {
        http.Error(w, "Forbidden", http.StatusForbidden)
        return
    }
    
    var req CreateStudentRequest
    json.NewDecoder(r.Body).Decode(&req)
    
    // 自校制約
    req.SchoolID = claims.SchoolID
    req.Role = "student"
    
    student, err := userService.CreateStudent(req)
    if err != nil {
        http.Error(w, "Student creation failed", http.StatusInternalServerError)
        return
    }
    
    json.NewEncoder(w).Encode(student)
}
```

---

## 📱 Next.js フロントエンド認証実装

### Auth0統合
```tsx
// app/providers.tsx
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div style={{backgroundColor: '#fdf8f0', minHeight: '100vh'}}>
        {children}
      </div>
    </UserProvider>
  );
}

// ログイン実装
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{background: 'linear-gradient(135deg, #fdf8f0, #f5e6d3)'}}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
               style={{backgroundColor: '#FF7F50'}}>
            <span className="text-2xl text-white">🌸</span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{color: '#2F1B14'}}>
            Bloomia
          </h1>
          <p className="text-lg" style={{color: '#8B4513'}}>
            中学校向け学習・公務支援システム
          </p>
        </div>
        
        <a
          href="/api/auth/login"
          className="w-full py-4 px-6 rounded-xl font-semibold text-white text-center block transition-all duration-300"
          style={{
            backgroundColor: '#FF7F50',
            boxShadow: '0 8px 20px rgba(255, 127, 80, 0.3)'
          }}
        >
          学校アカウントでログイン
        </a>
      </div>
    </div>
  );
}
```

---

## 🔧 開発環境セットアップ

### ローカル開発環境
```bash
# リポジトリクローン
git clone https://github.com/your-org/bloomia.git
cd bloomia

# 環境変数設定
cp .env.example .env.development

# Docker環境起動
docker-compose up -d

# データベース初期化
cd backend && go run cmd/migrate/main.go

# フロントエンド起動
cd frontend && npm install && npm run dev

# バックエンド起動
cd backend && go run cmd/server/main.go
```

### 必要な環境変数
```bash
# .env.development
DATABASE_URL=postgresql://postgres:password@localhost:5432/bloomia_dev
REDIS_URL=redis://localhost:6379
AUTH0_DOMAIN=bloomia-dev.auth0.com
AUTH0_CLIENT_ID=your-dev-client-id
AUTH0_CLIENT_SECRET=your-dev-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8080
DEFAULT_BACKGROUND_COLOR=#fdf8f0
DEFAULT_THEME_COLOR=#FF7F50
```

---

## 📋 実装チェックリスト

### 基盤システム
- [ ] Auth0認証統合（コーラルテーマ対応）
- [ ] PostgreSQL + Row Level Security
- [ ] Redis セッション・キャッシュ
- [ ] Railway Volumes ファイル管理
- [ ] Next.js App Router設定（背景色#fdf8f0適用）

### 核心機能
- [ ] ユーザー管理・権限制御（教員による自校管理）
- [ ] 教材・課題管理システム
- [ ] 成績・出席管理
- [ ] リアルタイムチャット（学校単位制約）
- [ ] 通知システム

### 新規機能
- [ ] ホワイトボード機能（リアルタイム描画）
- [ ] ノート機能（Markdown対応）
- [ ] 公務支援（教員フルアクセス）
- [ ] ゲーミフィケーション（コーラルテーマ）

### UI/UX
- [ ] コーラル（#FF7F50）テーマ適用
- [ ] 背景色（#fdf8f0）全体適用
- [ ] レスポンシブデザイン
- [ ] アクセシビリティ対応

### セキュリティ
- [ ] データ暗号化（個人情報）
- [ ] アクセス制御（学校別分離）
- [ ] セキュリティヘッダー
- [ ] 監査ログ・自動削除機能

### 運用・監視
- [ ] ヘルスチェック・監視
- [ ] パフォーマンス最適化
- [ ] バックアップ・復旧
- [ ] エラー追跡・ログ管理