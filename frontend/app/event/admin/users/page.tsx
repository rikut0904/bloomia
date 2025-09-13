'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

// モック用の定数
const THEME_COLORS = {
  primary: '#FF7F50',
  primaryDark: '#E55A2B',
  secondary: '#20B2AA'
};

const ROLE_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'admin', label: 'システム管理者' },
  { value: 'school_admin', label: '学校管理者' },
  { value: 'teacher', label: '教員' },
  { value: 'student', label: '生徒' }
];

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  school_name: string;
  is_active: boolean;
  is_approved: boolean;
}

// モック用のLoadingPageコンポーネント
const LoadingPage = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary"></div>
      <p className="text-lg">{message}</p>
    </div>
  </div>
);

// モック用のUserRoleBadgeコンポーネント
const UserRoleBadge = ({ role }: { role: string }) => {
  const roleLabels: { [key: string]: string } = {
    admin: 'システム管理者',
    school_admin: '学校管理者',
    teacher: '教員',
    student: '生徒'
  };

  const roleColors: { [key: string]: string } = {
    admin: 'bg-red-100 text-red-800',
    school_admin: 'bg-blue-100 text-blue-800',
    teacher: 'bg-green-100 text-green-800',
    student: 'bg-gray-100 text-gray-800'
  };

  return (
    <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
      {roleLabels[role] || role}
    </Badge>
  );
};

// モック用のUserStatusBadgesコンポーネント
const UserStatusBadges = ({ isActive, isApproved }: { isActive: boolean; isApproved: boolean }) => (
  <div className="flex gap-2">
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? 'アクティブ' : '非アクティブ'}
    </Badge>
    <Badge variant={isApproved ? 'default' : 'destructive'}>
      {isApproved ? '承認済み' : '未承認'}
    </Badge>
  </div>
);

export default function UserManagement() {
  const router = useRouter();

  // モックデータ
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
      role: 'teacher',
      school_name: 'サンプル高等学校',
      is_active: true,
      is_approved: true
    },
    {
      id: 2,
      name: '佐藤花子',
      email: 'sato@example.com',
      role: 'student',
      school_name: 'テスト中学校',
      is_active: true,
      is_approved: true
    },
    {
      id: 3,
      name: '山田次郎',
      email: 'yamada@example.com',
      role: 'school_admin',
      school_name: 'デモ小学校',
      is_active: false,
      is_approved: false
    }
  ]);

  const [schools] = useState([
    { id: 1, name: 'サンプル高等学校' },
    { id: 2, name: 'テスト中学校' },
    { id: 3, name: 'デモ小学校' }
  ]);

  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    school: 'all'
  });

  useEffect(() => {
    // モックデータの読み込み
    setLoading(false);
  }, []);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      school: 'all'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.search ||
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesSchool = filters.school === 'all' ||
      user.school_name === schools.find(s => s.id.toString() === filters.school)?.name;

    return matchesSearch && matchesRole && matchesSchool;
  });

  if (loading) {
    return <LoadingPage message="ユーザー情報を読み込み中..." />;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: THEME_COLORS.primaryDark }}>
              ユーザー管理
            </h1>
            <p className="mt-2 text-lg" style={{ color: THEME_COLORS.secondary }}>
              ユーザーの役割変更・権限管理・承認状況の管理
            </p>
          </div>
          <Button
            onClick={() => router.push('/admin/users/create')}
            style={{ backgroundColor: THEME_COLORS.primary, color: 'white' }}
          >
            新しいユーザーを作成
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <div className="mb-6 p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">フィルター・検索</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-2">検索</label>
            <input
              id="search"
              type="text"
              placeholder="名前またはメールアドレス"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium mb-2">役割</label>
            <select
              id="role-filter"
              value={filters.role}
              onChange={(e) => updateFilter('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_OPTIONS.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="school-filter" className="block text-sm font-medium mb-2">学校</label>
            <select
              id="school-filter"
              value={filters.school}
              onChange={(e) => updateFilter('school', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              {schools.map(school => (
                <option key={school.id} value={school.id.toString()}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={resetFilters}
              variant="outline"
              className="w-full"
            >
              リセット
            </Button>
          </div>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="border rounded-lg bg-white shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">ユーザー一覧 ({filteredUsers.length}名)</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">名前</th>
                  <th className="text-left py-3 px-4">メール</th>
                  <th className="text-left py-3 px-4">役割</th>
                  <th className="text-left py-3 px-4">学校</th>
                  <th className="text-left py-3 px-4">ステータス</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="py-3 px-4">{user.school_name || '-'}</td>
                    <td className="py-3 px-4">
                      <UserStatusBadges
                        isActive={user.is_active}
                        isApproved={user.is_approved}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        style={{ backgroundColor: THEME_COLORS.primary, color: 'white' }}
                      >
                        詳細
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p>ユーザーが見つかりません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}