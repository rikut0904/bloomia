export const ROLE_LABELS = {
  admin: 'システム管理者',
  school_admin: '学校管理者',
  teacher: '教員',
  student: '生徒'
} as const;

export const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800',
  school_admin: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  student: 'bg-gray-100 text-gray-800'
} as const;

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'システム管理者', description: 'システム全体の管理・設定・ユーザー管理' },
  { value: 'school_admin', label: '学校管理者', description: '学校内のユーザー管理・スケジュール管理・設定' },
  { value: 'teacher', label: '教員', description: '授業スケジュール・生徒管理・課題作成' },
  { value: 'student', label: '生徒', description: 'スケジュール確認・課題提出・成績確認' }
] as const;

export type Role = keyof typeof ROLE_LABELS;