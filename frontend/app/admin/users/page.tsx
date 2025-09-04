'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
  school_id?: number;
  school_name?: string;
  created_at: string;
  updated_at: string;
}

interface School {
  id: number;
  name: string;
}

const ROLE_LABELS = {
  admin: 'システム管理者',
  school_admin: '学校管理者',
  teacher: '教員',
  student: '生徒'
};

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800',
  school_admin: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  student: 'bg-gray-100 text-gray-800'
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState({ isActive: true, isApproved: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
    fetchSchools();
  }, []);

  const fetchUsers = async () => {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      // const response = await fetch('/api/v1/admin/users');
      // const data = await response.json();
      // setUsers(data.users);

      // モックデータ
      setUsers([
        {
          id: 1,
          uid: 'user_001',
          name: '田中太郎',
          email: 'tanaka@example.com',
          role: 'admin',
          is_active: true,
          is_approved: true,
          school_id: 1,
          school_name: 'サンプル高等学校',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          uid: 'user_002',
          name: '佐藤花子',
          email: 'sato@example.com',
          role: 'school_admin',
          is_active: true,
          is_approved: true,
          school_id: 1,
          school_name: 'サンプル高等学校',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z'
        },
        {
          id: 3,
          uid: 'user_003',
          name: '鈴木一郎',
          email: 'suzuki@example.com',
          role: 'teacher',
          is_active: true,
          is_approved: false,
          school_id: 1,
          school_name: 'サンプル高等学校',
          created_at: '2024-01-17T10:00:00Z',
          updated_at: '2024-01-17T10:00:00Z'
        },
        {
          id: 4,
          uid: 'user_004',
          name: '高橋美咲',
          email: 'takahashi@example.com',
          role: 'student',
          is_active: false,
          is_approved: true,
          school_id: 1,
          school_name: 'サンプル高等学校',
          created_at: '2024-01-18T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      // const response = await fetch('/api/v1/admin/schools');
      // const data = await response.json();
      // setSchools(data.schools);

      // モックデータ
      setSchools([
        { id: 1, name: 'サンプル高等学校' },
        { id: 2, name: 'テスト中学校' }
      ]);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewStatus({ isActive: user.is_active, isApproved: user.is_approved });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      // TODO: 実際のAPIエンドポイントに接続
      // await fetch(`/api/v1/admin/users/role`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     user_id: selectedUser.id,
      //     role: newRole
      //   })
      // });

      // await fetch(`/api/v1/admin/users/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     user_id: selectedUser.id,
      //     is_active: newStatus.isActive,
      //     is_approved: newStatus.isApproved
      //   })
      // });

      // モック更新
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: newRole, is_active: newStatus.isActive, is_approved: newStatus.isApproved }
          : user
      ));

      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSchool = schoolFilter === 'all' || user.school_id?.toString() === schoolFilter;
    
    return matchesSearch && matchesRole && matchesSchool;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: '#FF7F50'}}></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#2F1B14' }}>
          ユーザー管理
        </h1>
        <p className="mt-2 text-lg" style={{ color: '#8B4513' }}>
          ユーザーの役割変更・権限管理・承認状況の管理
        </p>
      </div>

      {/* フィルター */}
      <Card className="mb-6" style={{ borderColor: '#DEB887' }}>
        <CardHeader>
          <CardTitle style={{ color: '#2F1B14' }}>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">検索</Label>
              <Input
                id="search"
                placeholder="名前またはメールアドレス"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role-filter">役割</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="役割を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="admin">システム管理者</SelectItem>
                  <SelectItem value="school_admin">学校管理者</SelectItem>
                  <SelectItem value="teacher">教員</SelectItem>
                  <SelectItem value="student">生徒</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="school-filter">学校</Label>
              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="学校を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setSchoolFilter('all');
                }}
                variant="outline"
                style={{ borderColor: '#DEB887', color: '#8B4513' }}
              >
                リセット
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ユーザー一覧 */}
      <Card style={{ borderColor: '#DEB887' }}>
        <CardHeader>
          <CardTitle style={{ color: '#2F1B14' }}>
            ユーザー一覧 ({filteredUsers.length}件)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: '#DEB887' }}>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>名前</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>メール</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>役割</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>学校</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>ステータス</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b" style={{ borderColor: '#DEB887' }}>
                    <td className="py-3 px-4" style={{ color: '#2F1B14' }}>{user.name}</td>
                    <td className="py-3 px-4" style={{ color: '#2F1B14' }}>{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}>
                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4" style={{ color: '#2F1B14' }}>
                      {user.school_name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'アクティブ' : '非アクティブ'}
                        </Badge>
                        <Badge variant={user.is_approved ? 'default' : 'destructive'}>
                          {user.is_approved ? '承認済み' : '未承認'}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        style={{ backgroundColor: '#FF7F50', color: 'white' }}
                      >
                        編集
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー情報の編集</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} の情報を編集します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">役割</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="役割を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">システム管理者</SelectItem>
                  <SelectItem value="school_admin">学校管理者</SelectItem>
                  <SelectItem value="teacher">教員</SelectItem>
                  <SelectItem value="student">生徒</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ステータス</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newStatus.isActive}
                  onChange={(e) => setNewStatus({...newStatus, isActive: e.target.checked})}
                />
                <Label htmlFor="isActive">アクティブ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isApproved"
                  checked={newStatus.isApproved}
                  onChange={(e) => setNewStatus({...newStatus, isApproved: e.target.checked})}
                />
                <Label htmlFor="isApproved">承認済み</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdateUser} style={{ backgroundColor: '#FF7F50', color: 'white' }}>
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}