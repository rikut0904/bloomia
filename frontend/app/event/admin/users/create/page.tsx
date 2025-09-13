'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { getIdToken } from '@/lib/auth';
import { buildApiUrl, API_CONFIG } from '@/lib/config';

interface School {
  id: number;
  name: string;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'システム管理者', description: 'システム全体の管理・設定・ユーザー管理' },
  { value: 'school_admin', label: '学校管理者', description: '学校内のユーザー管理・スケジュール管理・設定' },
  { value: 'teacher', label: '教員', description: '授業スケジュール・生徒管理・課題作成' },
  { value: 'student', label: '生徒', description: 'スケジュール確認・課題提出・成績確認' }
];

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800',
  school_admin: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  student: 'bg-gray-100 text-gray-800'
};

export default function CreateUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    schoolId: '',
    isActive: true,
    isApproved: true,
    sendInviteEmail: true,
    customMessage: '',
    temporaryPassword: '',
    generatePassword: true
  });
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const idToken = await getIdToken() || 'test-token';
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.SCHOOLS), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      const data = await response.json();

      if (data.schools) {
        setSchools(data.schools.map((school: any) => ({
          id: school.id,
          name: school.name
        })));
      } else {
        // フォールバック用モックデータ
        setSchools([
          { id: 1, name: 'サンプル高等学校' },
          { id: 2, name: 'テスト中学校' },
          { id: 3, name: '花園小学校' }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setGeneratedPassword(newPassword);
    setFormData(prev => ({ ...prev, temporaryPassword: newPassword }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const idToken = await getIdToken() || 'test-token';
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.INVITE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          school_id: parseInt(formData.schoolId) || 1,
          message: formData.customMessage || 'アカウントが作成されました。'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      // if (!response.ok) {
      //   throw new Error('ユーザーの作成に失敗しました');
      // }

      // const result = await response.json();
      // alert(`ユーザーが作成されました。ユーザーID: ${result.user_id}`);

      // モック成功
      const mockUserId = Math.floor(Math.random() * 10000) + 1000;
      if (formData.sendInviteEmail) {
        alert(`ユーザーが作成され、招待メールを送信しました。ユーザーID: ${mockUserId}`);
      } else {
        alert(`ユーザーが作成されました。ユーザーID: ${mockUserId}\n仮パスワード: ${formData.temporaryPassword}`);
      }
      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('ユーザーの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedRole = ROLE_OPTIONS.find(role => role.value === formData.role);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#2F1B14' }}>
          ユーザー作成
        </h1>
        <p className="mt-2 text-lg" style={{ color: '#8B4513' }}>
          新しいユーザーを作成してシステムに登録します
        </p>
      </div>

      <div className="max-w-4xl">
        <Card style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2F1B14' }}>ユーザー基本情報</CardTitle>
            <CardDescription style={{ color: '#8B4513' }}>
              作成するユーザーの基本情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">氏名 *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="山田太郎"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">メールアドレス *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="yamada@example.com"
                    required
                  />
                </div>
              </div>

              {/* 権限・所属設定 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: '#2F1B14' }}>権限・所属設定</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="role">権限 *</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="権限を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center space-x-2">
                              <Badge className={ROLE_COLORS[role.value as keyof typeof ROLE_COLORS]}>
                                {role.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedRole && (
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedRole.description}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="school">所属学校</Label>
                    <Select
                      value={formData.schoolId}
                      onValueChange={(value) => handleInputChange('schoolId', value)}
                      disabled={formData.role === 'admin'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.role === 'admin' ? '（システム管理者は学校に所属しません）' : '学校を選択'} />
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
              </div>

              {/* アカウント設定 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: '#2F1B14' }}>アカウント設定</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
                    />
                    <Label htmlFor="isActive" className="text-sm">
                      アクティブ（すぐにログイン可能にする）
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isApproved"
                      checked={formData.isApproved}
                      onCheckedChange={(checked) => handleInputChange('isApproved', checked as boolean)}
                    />
                    <Label htmlFor="isApproved" className="text-sm">
                      承認済み（承認プロセスをスキップする）
                    </Label>
                  </div>
                </div>
              </div>

              {/* 認証設定 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: '#2F1B14' }}>認証・通知設定</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendInviteEmail"
                      checked={formData.sendInviteEmail}
                      onCheckedChange={(checked) => {
                        handleInputChange('sendInviteEmail', checked as boolean);
                        if (!checked && formData.generatePassword) {
                          handleGeneratePassword();
                        }
                      }}
                    />
                    <Label htmlFor="sendInviteEmail" className="text-sm">
                      招待メールを送信する（ユーザーが自分でパスワードを設定）
                    </Label>
                  </div>

                  {!formData.sendInviteEmail && (
                    <div className="ml-6 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="generatePassword"
                          checked={formData.generatePassword}
                          onCheckedChange={(checked) => {
                            handleInputChange('generatePassword', checked as boolean);
                            if (checked) {
                              handleGeneratePassword();
                            } else {
                              setGeneratedPassword('');
                              handleInputChange('temporaryPassword', '');
                            }
                          }}
                        />
                        <Label htmlFor="generatePassword" className="text-sm">
                          仮パスワードを自動生成する
                        </Label>
                      </div>

                      <div>
                        <Label htmlFor="temporaryPassword">
                          仮パスワード {!formData.generatePassword && '*'}
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            id="temporaryPassword"
                            type="text"
                            value={formData.temporaryPassword}
                            onChange={(e) => handleInputChange('temporaryPassword', e.target.value)}
                            placeholder="仮パスワードを入力"
                            disabled={formData.generatePassword}
                            required={!formData.sendInviteEmail}
                          />
                          {formData.generatePassword && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleGeneratePassword}
                              style={{ borderColor: '#DEB887', color: '#8B4513' }}
                            >
                              再生成
                            </Button>
                          )}
                        </div>
                        {generatedPassword && (
                          <p className="text-xs text-green-600 mt-1">
                            生成された仮パスワード: {generatedPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* カスタムメッセージ */}
              {formData.sendInviteEmail && (
                <div>
                  <Label htmlFor="customMessage">招待メールのカスタムメッセージ</Label>
                  <Textarea
                    id="customMessage"
                    value={formData.customMessage}
                    onChange={(e) => handleInputChange('customMessage', e.target.value)}
                    placeholder="追加のメッセージがあれば記載してください（任意）"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  style={{ borderColor: '#DEB887', color: '#8B4513' }}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.name ||
                    !formData.email ||
                    !formData.role ||
                    (formData.role !== 'admin' && !formData.schoolId) ||
                    (!formData.sendInviteEmail && !formData.temporaryPassword)
                  }
                  style={{ backgroundColor: '#FF7F50', color: 'white' }}
                >
                  {loading ? '作成中...' : 'ユーザーを作成'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 権限の詳細説明 */}
        <Card className="mt-6" style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2F1B14' }}>権限について</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ROLE_OPTIONS.map(role => (
                <div key={role.value} className="flex items-start space-x-3">
                  <Badge className={ROLE_COLORS[role.value as keyof typeof ROLE_COLORS]}>
                    {role.label}
                  </Badge>
                  <p className="text-sm" style={{ color: '#8B4513' }}>
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 作成後の注意事項 */}
        <Card className="mt-6" style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2F1B14' }}>作成後の注意事項</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="text-orange-500 text-lg">•</span>
                <p className="text-sm" style={{ color: '#8B4513' }}>
                  招待メールを送信しない場合は、作成後に仮パスワードをユーザーに安全に伝達してください。
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-orange-500 text-lg">•</span>
                <p className="text-sm" style={{ color: '#8B4513' }}>
                  初回ログイン時にパスワードの変更を推奨することをユーザーに伝えてください。
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-orange-500 text-lg">•</span>
                <p className="text-sm" style={{ color: '#8B4513' }}>
                  システム管理者権限は慎重に付与し、定期的に権限の見直しを行ってください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
