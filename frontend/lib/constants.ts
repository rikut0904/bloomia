// テーマカラー定数
export const THEME_COLORS = {
  primary: '#FF7F50',      // コーラル
  primaryDark: '#2F1B14',  // ダークブラウン
  secondary: '#8B4513',    // ミディアムブラウン
  border: '#DEB887',       // ライトブラウン
  background: '#fdf8f0',   // クリーム色
} as const;

// ユーザー役割の定義
export const USER_ROLES = {
  admin: 'admin',
  school_admin: 'school_admin', 
  teacher: 'teacher',
  student: 'student',
} as const;

export const ROLE_LABELS = {
  [USER_ROLES.admin]: 'システム管理者',
  [USER_ROLES.school_admin]: '学校管理者',
  [USER_ROLES.teacher]: '教員',
  [USER_ROLES.student]: '生徒',
} as const;

export const ROLE_COLORS = {
  [USER_ROLES.admin]: 'bg-red-100 text-red-800',
  [USER_ROLES.school_admin]: 'bg-blue-100 text-blue-800',
  [USER_ROLES.teacher]: 'bg-green-100 text-green-800',
  [USER_ROLES.student]: 'bg-gray-100 text-gray-800',
} as const;

// 統計カードの設定
export const STAT_CARD_CONFIG = [
  {
    key: 'admin' as const,
    title: 'システム管理者',
    icon: '👑',
  },
  {
    key: 'school_admin' as const,
    title: '学校管理者', 
    icon: '🏫',
  },
  {
    key: 'teacher' as const,
    title: '教員',
    icon: '👩‍🏫',
  },
  {
    key: 'student' as const,
    title: '生徒',
    icon: '👨‍🎓',
  },
] as const;

// 管理機能クイックリンクの設定
export const ADMIN_QUICK_LINKS = [
  {
    title: 'ユーザー管理',
    description: 'ユーザーの役割変更・権限管理・承認状況の管理',
    icon: '👥',
    links: [
      { href: '/admin/users', label: 'ユーザー一覧を見る' },
      { href: '/admin/users/create', label: '新しいユーザーを招待' },
    ],
  },
  {
    title: '学校管理',
    description: '学校情報の管理・設定・新規学校の追加',
    icon: '🏫',
    links: [
      { href: '/admin/schools', label: '学校一覧を見る' },
      { href: '/admin/schools/create', label: '新しい学校を追加' },
    ],
  },
  {
    title: 'システム統計',
    description: '利用状況・パフォーマンス・エラー統計の確認',
    icon: '📊',
    links: [
      { href: '#', label: '近日実装予定' },
    ],
  },
] as const;