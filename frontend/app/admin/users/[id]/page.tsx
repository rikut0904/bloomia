'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  last_login?: string;
  created_at: string;
  updated_at: string;
  profile?: {
    phone?: string;
    department?: string;
    position?: string;
    bio?: string;
  };
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

const ROLE_OPTIONS = [
  { value: 'admin', label: 'システム管理者', description: 'システム全体の管理・設定・ユーザー管理' },
  { value: 'school_admin', label: '学校管理者', description: '学校内のユーザー管理・スケジュール管理・設定' },
  { value: 'teacher', label: '教員', description: '授業スケジュール・生徒管理・課題作成' },
  { value: 'student', label: '生徒', description: 'スケジュール確認・課題提出・成績確認' }
];

export default function UserDetails() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchSchools();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setEditFormData(data.user);
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      // エラー時はモックデータでフォールバック
      const mockUser: User = {
        id: parseInt(userId),
        uid: `user_${userId.padStart(3, '0')}`,
        name: '田中太郎',
        email: 'tanaka@example.com',
        role: 'teacher',
        is_active: true,
        is_approved: true,
        school_id: 1,
        school_name: 'サンプル高等学校',
        last_login: '2024-01-20T10:30:00Z',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        profile: {
          phone: '090-1234-5678',
          department: '数学科',
          position: '主任教諭',
          bio: '数学教育に20年従事。生徒の論理的思考力向上を目指している。'
        }
      };
      setUser(mockUser);
      setEditFormData(mockUser);
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
        { id: 2, name: 'テスト中学校' },
        { id: 3, name: '花園小学校' }
      ]);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setIsEditDialogOpen(false);
        alert('ユーザー情報を更新しました');
      } else {
        throw new Error('ユーザー情報の更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('ユーザー情報の更新に失敗しました');
    }
  };

  const handleToggleUserStatus = async (field: 'is_active' | 'is_approved') => {
    if (!user) return;

    try {
      // TODO: 実際のAPIエンドポイントに接続
      // const response = await fetch(`/api/v1/admin/users/${userId}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ [field]: !user[field] })
      // });

      // モック更新
      setUser({ ...user, [field]: !user[field] });
      const statusName = field === 'is_active' ? 'アクティブ' : '承認';
      alert(`ユーザーを${!user[field] ? statusName : `非${statusName}`}にしました`);
    } catch (error) {
      console.error(`Failed to toggle user ${field}:`, error);
      alert('ユーザーステータスの更新に失敗しました');
    }
  };

  const handlePasswordReset = async () => {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      // const response = await fetch(`/api/v1/admin/users/${userId}/reset-password`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // });

      // モック成功
      setIsPasswordResetDialogOpen(false);
      alert('パスワードリセットメールを送信しました');
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('パスワードリセットに失敗しました');
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('本当にこのユーザーを削除しますか？この操作は取り消すことができません。')) {
      return;
    }

    try {
      // TODO: 実際のAPIエンドポイントに接続
      // const response = await fetch(`/api/v1/admin/users/${userId}`, {
      //   method: 'DELETE'
      // });

      // モック成功
      alert('ユーザーを削除しました');
      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('ユーザーの削除に失敗しました');
    }
  };

  const handleEditFormChange = (field: string, value: string | boolean | number) => {
    if (field.startsWith('profile.')) {
      const profileField = field.replace('profile.', '');
      setEditFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setEditFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: '#FF7F50'}}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2F1B14' }}>
            ユーザーが見つかりません
          </h1>
          <Button onClick={() => router.back()} style={{ backgroundColor: '#FF7F50', color: 'white' }}>
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#2F1B14' }}>
              {user.name}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}>
                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
              </Badge>
              <Badge variant={user.is_active ? 'default' : 'secondary'}>
                {user.is_active ? 'アクティブ' : '非アクティブ'}
              </Badge>
              <Badge variant={user.is_approved ? 'default' : 'destructive'}>
                {user.is_approved ? '承認済み' : '未承認'}
              </Badge>
              <p className="text-lg" style={{ color: '#8B4513' }}>
                ユーザーID: {user.uid}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              style={{ borderColor: '#DEB887', color: '#8B4513' }}
            >
              戻る
            </Button>
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              style={{ backgroundColor: '#FF7F50', color: 'white' }}
            >
              編集
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">ユーザー詳細</TabsTrigger>
          <TabsTrigger value="security">セキュリティ</TabsTrigger>
          <TabsTrigger value="activity">アクティビティ</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 基本情報 */}
            <Card style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>氏名</Label>
                  <p className="text-sm" style={{ color: '#2F1B14' }}>{user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>メールアドレス</Label>
                  <p className="text-sm" style={{ color: '#2F1B14' }}>{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>権限</Label>
                  <div className="mt-1">
                    <Badge className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}>
                      {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                    </Badge>
                  </div>
                </div>
                {user.school_name && (
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>所属学校</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{user.school_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* プロフィール情報 */}
            <Card style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>プロフィール情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.profile?.phone && (
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>電話番号</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{user.profile.phone}</p>
                  </div>
                )}
                {user.profile?.department && (
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>所属部署</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{user.profile.department}</p>
                  </div>
                )}
                {user.profile?.position && (
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>役職</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{user.profile.position}</p>
                  </div>
                )}
                {user.profile?.bio && (
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>自己紹介</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{user.profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* システム情報 */}
            <Card style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>システム情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>作成日</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>最終更新日</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>
                      {new Date(user.updated_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                {user.last_login && (
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>最終ログイン</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>
                      {new Date(user.last_login).toLocaleString('ja-JP')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ステータス管理 */}
            <Card style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>ステータス管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span style={{ color: '#8B4513' }}>アクティブ状態</span>
                  <Button
                    onClick={() => handleToggleUserStatus('is_active')}
                    variant={user.is_active ? 'destructive' : 'default'}
                    size="sm"
                  >
                    {user.is_active ? '無効化' : '有効化'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#8B4513' }}>承認状態</span>
                  <Button
                    onClick={() => handleToggleUserStatus('is_approved')}
                    variant={user.is_approved ? 'destructive' : 'default'}
                    size="sm"
                  >
                    {user.is_approved ? '承認取消' : '承認'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card style={{ borderColor: '#DEB887' }}>
            <CardHeader>
              <CardTitle style={{ color: '#2F1B14' }}>セキュリティ管理</CardTitle>
              <CardDescription>
                パスワード管理やアカウントセキュリティに関する操作
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#DEB887' }}>
                <div>
                  <h4 className="font-semibold" style={{ color: '#2F1B14' }}>パスワードリセット</h4>
                  <p className="text-sm" style={{ color: '#8B4513' }}>
                    ユーザーにパスワードリセットメールを送信します
                  </p>
                </div>
                <Button
                  onClick={() => setIsPasswordResetDialogOpen(true)}
                  variant="outline"
                  style={{ borderColor: '#FF7F50', color: '#FF7F50' }}
                >
                  リセット実行
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                <div>
                  <h4 className="font-semibold text-red-800">ユーザー削除</h4>
                  <p className="text-sm text-red-600">
                    このユーザーを完全に削除します（この操作は取り消せません）
                  </p>
                </div>
                <Button
                  onClick={handleDeleteUser}
                  variant="destructive"
                >
                  削除
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card style={{ borderColor: '#DEB887' }}>
            <CardHeader>
              <CardTitle style={{ color: '#2F1B14' }}>アクティビティログ</CardTitle>
              <CardDescription>
                ユーザーの活動履歴（実装予定）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p style={{ color: '#8B4513' }}>アクティビティログ機能は実装予定です</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ユーザー情報の編集</DialogTitle>
            <DialogDescription>
              {user.name} の情報を編集します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">氏名 *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ''}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">メールアドレス *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => handleEditFormChange('email', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">権限 *</Label>
                <Select value={editFormData.role || ''} onValueChange={(value) => handleEditFormChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="権限を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-school">所属学校</Label>
                <Select 
                  value={editFormData.school_id?.toString() || ''} 
                  onValueChange={(value) => handleEditFormChange('school_id', parseInt(value))}
                  disabled={editFormData.role === 'admin'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={editFormData.role === 'admin' ? '（システム管理者）' : '学校を選択'} />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">電話番号</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.profile?.phone || ''}
                  onChange={(e) => handleEditFormChange('profile.phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-department">所属部署</Label>
                <Input
                  id="edit-department"
                  value={editFormData.profile?.department || ''}
                  onChange={(e) => handleEditFormChange('profile.department', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-position">役職</Label>
              <Input
                id="edit-position"
                value={editFormData.profile?.position || ''}
                onChange={(e) => handleEditFormChange('profile.position', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-bio">自己紹介</Label>
              <Textarea
                id="edit-bio"
                value={editFormData.profile?.bio || ''}
                onChange={(e) => handleEditFormChange('profile.bio', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEditUser} style={{ backgroundColor: '#FF7F50', color: 'white' }}>
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* パスワードリセット確認ダイアログ */}
      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>パスワードリセット確認</DialogTitle>
            <DialogDescription>
              {user.name} ({user.email}) にパスワードリセットメールを送信しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordResetDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handlePasswordReset} style={{ backgroundColor: '#FF7F50', color: 'white' }}>
              リセットメール送信
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}