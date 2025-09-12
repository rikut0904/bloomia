'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { FilterCard } from '@/components/common/FilterCard';
import { DataTable } from '@/components/common/DataTable';
import { UserRoleBadge } from '@/components/admin/UserRoleBadge';
import { UserStatusBadges } from '@/components/admin/UserStatusBadges';
import { useUserManagement, User } from '@/hooks/useUserManagement';
import { useSchools } from '@/hooks/useSchools';
import { useFilters } from '@/hooks/useFilters';
import { THEME_COLORS } from '@/lib/constants';
import { ROLE_OPTIONS } from '@/constants/roles';

export default function UserManagement() {
  const router = useRouter();
  const { users, loading, fetchUsers } = useUserManagement();
  const { schools } = useSchools();
  
  const { filters, updateFilter, resetFilters } = useFilters({
    initialFilters: {
      search: '',
      role: 'all',
      school: 'all'
    },
    onFilterChange: (newFilters) => {
      fetchUsers({
        search: newFilters.search,
        role: newFilters.role,
        school_id: newFilters.school
      });
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);



  const filterFields = [
    {
      key: 'search',
      label: '検索',
      type: 'input' as const,
      placeholder: '名前またはメールアドレス'
    },
    {
      key: 'role',
      label: '役割',
      type: 'select' as const,
      options: ROLE_OPTIONS.map(role => ({ value: role.value, label: role.label }))
    },
    {
      key: 'school',
      label: '学校',
      type: 'select' as const,
      options: schools.map(school => ({ value: school.id.toString(), label: school.name }))
    }
  ];

  const tableColumns = [
    {
      key: 'name',
      label: '名前'
    },
    {
      key: 'email',
      label: 'メール'
    },
    {
      key: 'role',
      label: '役割',
      render: (user: User) => <UserRoleBadge role={user.role} />
    },
    {
      key: 'school_name',
      label: '学校',
      render: (user: User) => user.school_name || '-'
    },
    {
      key: 'status',
      label: 'ステータス',
      render: (user: User) => (
        <UserStatusBadges 
          isActive={user.is_active} 
          isApproved={user.is_approved} 
        />
      )
    },
    {
      key: 'actions',
      label: '操作',
      render: (user: User) => (
        <Button
          size="sm"
          onClick={() => router.push(`/admin/users/${user.id}`)}
          style={{ backgroundColor: THEME_COLORS.primary, color: 'white' }}
        >
          詳細
        </Button>
      )
    }
  ];

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

      <FilterCard
        fields={filterFields}
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        loading={loading}
      />

      <DataTable
        title="ユーザー一覧"
        columns={tableColumns}
        data={users}
        keyExtractor={(user) => user.id.toString()}
        loading={loading}
        emptyMessage="ユーザーが見つかりません"
      />

    </div>
  );
}