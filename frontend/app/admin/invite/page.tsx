'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

interface School {
  id: number;
  name: string;
}

const ROLE_OPTIONS = [
  { value: 'school_admin', label: '学校管理者' },
  { value: 'teacher', label: '教員' },
  { value: 'student', label: '生徒' }
];

export default function InviteUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    schoolId: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);

  // モックデータ（実際のAPIから取得）
  useState(() => {
    setSchools([
      { id: 1, name: 'サンプル高等学校' },
      { id: 2, name: 'テスト中学校' }
    ]);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: 実際のAPIエンドポイントに接続
      // const response = await fetch('/api/v1/admin/invite', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     role: formData.role,
      //     school_id: parseInt(formData.schoolId),
      //     message: formData.message
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('招待の送信に失敗しました');
      // }

      // モック成功
      alert('ユーザー招待を送信しました');
      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('招待の送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#2F1B14' }}>
          ユーザー招待
        </h1>
        <p className="mt-2 text-lg" style={{ color: '#8B4513' }}>
          新しいユーザーを招待して権限を設定します
        </p>
      </div>

      <div className="max-w-2xl">
        <Card style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2F1B14' }}>招待情報</CardTitle>
            <CardDescription style={{ color: '#8B4513' }}>
              招待するユーザーの情報と権限を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">名前 *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="田中太郎"
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
                    placeholder="tanaka@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="role">権限 *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
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
                  <Label htmlFor="school">学校 *</Label>
                  <Select value={formData.schoolId} onValueChange={(value) => handleInputChange('schoolId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="学校を選択" />
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

              <div>
                <Label htmlFor="message">招待メッセージ</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Bloomiaシステムへの招待です。以下のリンクからアカウントを作成してください。"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-4">
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
                  disabled={loading || !formData.name || !formData.email || !formData.role || !formData.schoolId}
                  style={{ backgroundColor: '#FF7F50', color: 'white' }}
                >
                  {loading ? '送信中...' : '招待を送信'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 権限の説明 */}
        <Card className="mt-6" style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2F1B14' }}>権限について</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold" style={{ color: '#2F1B14' }}>学校管理者</h4>
                <p className="text-sm" style={{ color: '#8B4513' }}>
                  学校内のユーザー管理、スケジュール管理、システム設定を行うことができます。
                </p>
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: '#2F1B14' }}>教員</h4>
                <p className="text-sm" style={{ color: '#8B4513' }}>
                  授業スケジュールの確認、生徒の管理、課題の作成・管理を行うことができます。
                </p>
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: '#2F1B14' }}>生徒</h4>
                <p className="text-sm" style={{ color: '#8B4513' }}>
                  自分のスケジュール確認、課題の提出、成績の確認を行うことができます。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}