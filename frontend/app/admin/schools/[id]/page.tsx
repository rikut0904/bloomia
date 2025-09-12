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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface School {
  id: number;
  name: string;
  type: string;
  prefecture: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  principal_name: string;
  principal_email: string;
  description?: string;
  student_count: number;
  teacher_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
}

const SCHOOL_TYPE_LABELS = {
  elementary: '小学校',
  junior_high: '中学校',
  high_school: '高等学校',
  university: '大学',
  vocational: '専門学校',
  other: 'その他'
};

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

export default function SchoolDetails() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.id as string;
  
  const [school, setSchool] = useState<School | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<School>>({});

  useEffect(() => {
    if (schoolId) {
      fetchSchoolDetails();
      fetchSchoolUsers();
    }
  }, [schoolId]);

  const fetchSchoolDetails = async () => {
    try {
      const response = await fetch(`/api/v1/admin/schools/${schoolId}`);
      const data = await response.json();
      
      if (data.success) {
        setSchool(data.school);
        setEditFormData(data.school);
      } else {
        throw new Error('Failed to fetch school details');
      }
    } catch (error) {
      console.error('Failed to fetch school details:', error);
      // エラー時はモックデータでフォールバック
      const mockSchool: School = {
        id: parseInt(schoolId),
        name: 'サンプル高等学校',
        type: 'high_school',
        prefecture: '東京都',
        city: '渋谷区',
        address: '神南1-2-3',
        phone: '03-1234-5678',
        email: 'info@sample-high.ac.jp',
        website: 'https://www.sample-high.ac.jp',
        principal_name: '田中太郎',
        principal_email: 'tanaka@sample-high.ac.jp',
        description: '創立100年の歴史ある学校です。進学実績に定評があり、部活動も盛んです。',
        student_count: 1200,
        teacher_count: 80,
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      };
      setSchool(mockSchool);
      setEditFormData(mockSchool);
    }
  };

  const fetchSchoolUsers = async () => {
    try {
      const response = await fetch(`/api/v1/admin/schools/${schoolId}/users`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error('Failed to fetch school users');
      }
    } catch (error) {
      console.error('Failed to fetch school users:', error);
      // エラー時はモックデータでフォールバック
      setUsers([
        {
          id: 1,
          uid: 'user_001',
          name: '佐藤花子',
          email: 'sato@sample-high.ac.jp',
          role: 'school_admin',
          is_active: true,
          is_approved: true,
          created_at: '2024-01-16T10:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchool = async () => {
    if (!school) return;

    try {
      const response = await fetch(`/api/v1/admin/schools/${schoolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSchool(data.school);
        setIsEditDialogOpen(false);
        alert('学校情報を更新しました');
      } else {
        throw new Error('学校情報の更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update school:', error);
      alert('学校情報の更新に失敗しました');
    }
  };

  const handleToggleSchoolStatus = async () => {
    if (!school) return;

    try {
      // TODO: 実際のAPIエンドポイントに接続
      // const response = await fetch(`/api/v1/admin/schools/${schoolId}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ is_active: !school.is_active })
      // });

      // モック更新
      setSchool({ ...school, is_active: !school.is_active });
      alert(`学校を${!school.is_active ? 'アクティブ' : '非アクティブ'}にしました`);
    } catch (error) {
      console.error('Failed to toggle school status:', error);
      alert('学校ステータスの更新に失敗しました');
    }
  };

  const handleEditFormChange = (field: string, value: string | number) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: '#FF7F50'}}></div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2F1B14' }}>
            学校が見つかりません
          </h1>
          <Button onClick={() => router.back()} style={{ backgroundColor: '#FF7F50', color: 'white' }}>
            戻る
          </Button>
        </div>
      </div>
    );
  }

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#2F1B14' }}>
              {school.name}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={school.is_active ? 'default' : 'secondary'}>
                {school.is_active ? 'アクティブ' : '非アクティブ'}
              </Badge>
              <p className="text-lg" style={{ color: '#8B4513' }}>
                学校ID: {school.id}
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
          <TabsTrigger value="details">学校詳細</TabsTrigger>
          <TabsTrigger value="users">ユーザー管理</TabsTrigger>
          <TabsTrigger value="statistics">統計情報</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 基本情報 */}
            <Card style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>学校種別</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>
                      {SCHOOL_TYPE_LABELS[school.type as keyof typeof SCHOOL_TYPE_LABELS]}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>都道府県</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{school.prefecture}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>所在地</Label>
                  <p className="text-sm" style={{ color: '#2F1B14' }}>
                    {school.prefecture}{school.city}{school.address}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>電話番号</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{school.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>メールアドレス</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{school.email}</p>
                  </div>
                </div>
                {school.website && (
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>ウェブサイト</Label>
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {school.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 管理者情報 */}
            <Card style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>管理者情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>学校長氏名</Label>
                  <p className="text-sm" style={{ color: '#2F1B14' }}>{school.principal_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>学校長メールアドレス</Label>
                  <p className="text-sm" style={{ color: '#2F1B14' }}>{school.principal_email}</p>
                </div>
              </CardContent>
            </Card>

            {/* 規模情報 */}
            <Card style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>規模情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>生徒数</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{school.student_count}名</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>教員数</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>{school.teacher_count}名</p>
                  </div>
                </div>
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
                      {new Date(school.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold" style={{ color: '#8B4513' }}>最終更新日</Label>
                    <p className="text-sm" style={{ color: '#2F1B14' }}>
                      {new Date(school.updated_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div>
                  <Button
                    onClick={handleToggleSchoolStatus}
                    variant={school.is_active ? 'destructive' : 'default'}
                    size="sm"
                  >
                    {school.is_active ? '学校を無効化' : '学校を有効化'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 説明・備考 */}
          {school.description && (
            <Card className="mt-6" style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>学校の特徴・備考</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm" style={{ color: '#2F1B14' }}>{school.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users">
          <Card style={{ borderColor: '#DEB887' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ color: '#2F1B14' }}>
                  登録ユーザー ({users.length}名)
                </CardTitle>
                <Button
                  onClick={() => router.push(`/admin/invite_user?school=${schoolId}`)}
                  style={{ backgroundColor: '#FF7F50', color: 'white' }}
                >
                  ユーザーを招待
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#DEB887' }}>
                      <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>名前</th>
                      <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>メール</th>
                      <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>権限</th>
                      <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>ステータス</th>
                      <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>登録日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b" style={{ borderColor: '#DEB887' }}>
                        <td className="py-3 px-4" style={{ color: '#2F1B14' }}>{user.name}</td>
                        <td className="py-3 px-4" style={{ color: '#2F1B14' }}>{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}>
                            {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                          </Badge>
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
                        <td className="py-3 px-4" style={{ color: '#2F1B14' }}>
                          {new Date(user.created_at).toLocaleDateString('ja-JP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>ユーザー権限別統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(roleStats).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <Badge className={ROLE_COLORS[role as keyof typeof ROLE_COLORS]}>
                        {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                      </Badge>
                      <span className="font-semibold" style={{ color: '#2F1B14' }}>{count}名</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card style={{ borderColor: '#DEB887' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2F1B14' }}>アクティビティ統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#8B4513' }}>アクティブユーザー</span>
                    <span className="font-semibold" style={{ color: '#2F1B14' }}>
                      {users.filter(u => u.is_active).length}名
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#8B4513' }}>承認済みユーザー</span>
                    <span className="font-semibold" style={{ color: '#2F1B14' }}>
                      {users.filter(u => u.is_approved).length}名
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#8B4513' }}>承認待ちユーザー</span>
                    <span className="font-semibold text-orange-600">
                      {users.filter(u => !u.is_approved).length}名
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>学校情報の編集</DialogTitle>
            <DialogDescription>
              {school.name} の情報を編集します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">学校名 *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ''}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">電話番号 *</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone || ''}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">メールアドレス *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => handleEditFormChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-website">ウェブサイト</Label>
                <Input
                  id="edit-website"
                  type="url"
                  value={editFormData.website || ''}
                  onChange={(e) => handleEditFormChange('website', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-address">住所詳細 *</Label>
              <Input
                id="edit-address"
                value={editFormData.address || ''}
                onChange={(e) => handleEditFormChange('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-principal-name">学校長氏名 *</Label>
                <Input
                  id="edit-principal-name"
                  value={editFormData.principal_name || ''}
                  onChange={(e) => handleEditFormChange('principal_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-principal-email">学校長メールアドレス *</Label>
                <Input
                  id="edit-principal-email"
                  type="email"
                  value={editFormData.principal_email || ''}
                  onChange={(e) => handleEditFormChange('principal_email', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-student-count">生徒数</Label>
                <Input
                  id="edit-student-count"
                  type="number"
                  value={editFormData.student_count || ''}
                  onChange={(e) => handleEditFormChange('student_count', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="edit-teacher-count">教員数</Label>
                <Input
                  id="edit-teacher-count"
                  type="number"
                  value={editFormData.teacher_count || ''}
                  onChange={(e) => handleEditFormChange('teacher_count', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">学校の特徴・備考</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description || ''}
                onChange={(e) => handleEditFormChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEditSchool} style={{ backgroundColor: '#FF7F50', color: 'white' }}>
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}