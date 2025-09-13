'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { buildApiUrl, API_CONFIG } from '@/lib/config';
import { getIdToken } from '@/lib/auth';

const SCHOOL_TYPES = [
  { value: 'elementary', label: '小学校' },
  { value: 'junior_high', label: '中学校' },
  { value: 'high_school', label: '高等学校' },
  { value: 'university', label: '大学' },
  { value: 'vocational', label: '専門学校' },
  { value: 'other', label: 'その他' }
];

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export default function CreateSchool() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    prefecture: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    principalEmail: '',
    description: '',
    studentCount: '',
    teacherCount: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const idToken = await getIdToken() || 'test-token';
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.SCHOOLS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          prefecture: formData.prefecture,
          city: formData.city,
          address: formData.address,
          phone: formData.phone,
          principalName: formData.principalName,
        })
      });

      if (!response.ok) {
        throw new Error('学校の作成に失敗しました');
      }

      const result = await response.json();
      alert(`学校が作成されました。学校コード: ${result.code}`);
      router.push('/admin/schools');
    } catch (error) {
      console.error('Failed to create school:', error);
      alert('学校の作成に失敗しました');
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
          学校ID作成
        </h1>
        <p className="mt-2 text-lg" style={{ color: '#8B4513' }}>
          新しい学校をシステムに登録します
        </p>
      </div>

      <div className="max-w-4xl">
        <Card style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2F1B14' }}>学校基本情報</CardTitle>
            <CardDescription style={{ color: '#8B4513' }}>
              学校の基本的な情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">学校名 *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="○○高等学校"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">学校種別 *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="学校種別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prefecture">都道府県 *</Label>
                  <Select value={formData.prefecture} onValueChange={(value) => handleInputChange('prefecture', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="都道府県を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREFECTURES.map(prefecture => (
                        <SelectItem key={prefecture} value={prefecture}>
                          {prefecture}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 所在地情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: '#2F1B14' }}>所在地情報</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city">市区町村 *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="渋谷区"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">電話番号 *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="03-1234-5678"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">住所詳細 *</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="神南1-2-3"
                    required
                  />
                </div>
              </div>

              {/* 連絡先情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: '#2F1B14' }}>連絡先情報</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email">学校代表メールアドレス *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="info@school.ac.jp"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">ウェブサイト</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.school.ac.jp"
                    />
                  </div>
                </div>
              </div>

              {/* 管理者情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: '#2F1B14' }}>管理者情報</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="principalName">学校長氏名 *</Label>
                    <Input
                      id="principalName"
                      type="text"
                      value={formData.principalName}
                      onChange={(e) => handleInputChange('principalName', e.target.value)}
                      placeholder="山田太郎"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="principalEmail">学校長メールアドレス *</Label>
                    <Input
                      id="principalEmail"
                      type="email"
                      value={formData.principalEmail}
                      onChange={(e) => handleInputChange('principalEmail', e.target.value)}
                      placeholder="principal@school.ac.jp"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 規模情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: '#2F1B14' }}>規模情報</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="studentCount">生徒数（概算）</Label>
                    <Input
                      id="studentCount"
                      type="number"
                      value={formData.studentCount}
                      onChange={(e) => handleInputChange('studentCount', e.target.value)}
                      placeholder="500"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacherCount">教員数（概算）</Label>
                    <Input
                      id="teacherCount"
                      type="number"
                      value={formData.teacherCount}
                      onChange={(e) => handleInputChange('teacherCount', e.target.value)}
                      placeholder="50"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 備考 */}
              <div>
                <Label htmlFor="description">学校の特徴・備考</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="学校の特徴や特記事項があれば記載してください"
                  rows={4}
                />
              </div>

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
                  disabled={loading || !formData.name || !formData.type || !formData.prefecture || !formData.city || !formData.address || !formData.phone || !formData.email || !formData.principalName || !formData.principalEmail}
                  style={{ backgroundColor: '#FF7F50', color: 'white' }}
                >
                  {loading ? '作成中...' : '学校を作成'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 作成後の流れ */}
        <Card className="mt-6" style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2F1B14' }}>学校作成後の流れ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ backgroundColor: '#FF7F50' }}>
                  1
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: '#2F1B14' }}>学校IDの発行</h4>
                  <p className="text-sm" style={{ color: '#8B4513' }}>
                    学校が作成されると、一意の学校IDが自動的に発行されます。
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ backgroundColor: '#FF7F50' }}>
                  2
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: '#2F1B14' }}>学校管理者の招待</h4>
                  <p className="text-sm" style={{ color: '#8B4513' }}>
                    学校長または担当者に学校管理者権限でシステムの招待メールが送信されます。
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ backgroundColor: '#FF7F50' }}>
                  3
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: '#2F1B14' }}>ユーザー管理の開始</h4>
                  <p className="text-sm" style={{ color: '#8B4513' }}>
                    学校管理者が教員や生徒をシステムに招待できるようになります。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
