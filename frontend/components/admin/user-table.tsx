import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRoleBadge } from './user-role-badge';
import { User } from '@/hooks/useUsers';
import { THEME_COLORS } from '@/lib/constants';

export interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  loading?: boolean;
}

export function UserTable({ users, onEditUser, loading }: UserTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" 
                 style={{ borderColor: THEME_COLORS.primary }}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            ユーザーが見つかりません
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: THEME_COLORS.primaryDark }}>
          ユーザー一覧 ({users.length}名)
        </CardTitle>
        <CardDescription>
          システム内の全ユーザーの管理と役割の変更ができます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <UserTableRow 
              key={user.id} 
              user={user} 
              onEdit={() => onEditUser(user)} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UserTableRow({ user, onEdit }: { user: User; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <h4 className="font-medium" style={{ color: THEME_COLORS.primaryDark }}>
              {user.name || 'Unknown User'}
            </h4>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.school_name && (
              <p className="text-xs" style={{ color: THEME_COLORS.secondary }}>
                {user.school_name}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <UserRoleBadge role={user.role} />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit}
          className="hover:bg-gray-100"
        >
          編集
        </Button>
      </div>
    </div>
  );
}