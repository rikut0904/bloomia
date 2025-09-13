'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
// モック用の定数
const THEME_COLORS = {
  primary: '#FF7F50',
  primaryDark: '#E55A2B',
  secondary: '#20B2AA'
};

interface School {
  id: number;
  name: string;
  type: string;
  prefecture: string;
  city: string;
  phone: string;
  email: string;
  principal_name: string;
  student_count: number;
  teacher_count: number;
  user_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SCHOOL_TYPE_LABELS = {
  elementary: '小学校',
  junior_high: '中学校',
  high_school: '高等学校',
  university: '大学',
  vocational: '専門学校',
  other: 'その他'
};

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export default function SchoolManagement() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [prefectureFilter, setPrefectureFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSchools();
  }, []);

  // フィルターが変更された時の再取得（デバウンス付き）
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (!loading) {
        fetchSchools();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, typeFilter, prefectureFilter, statusFilter]);

  const fetchSchools = async () => {
    try {
      // モックデータを直接設定
      const mockSchools = [
        {
          id: 1,
          name: 'サンプル高等学校',
          type: 'high_school',
          prefecture: '東京都',
          city: '渋谷区',
          phone: '03-1234-5678',
          email: 'info@sample-high.ac.jp',
          principal_name: '田中太郎',
          student_count: 1200,
          teacher_count: 80,
          user_count: 1283,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'テスト中学校',
          type: 'junior_high',
          prefecture: '大阪府',
          city: '大阪市',
          phone: '06-1234-5678',
          email: 'info@test-junior.ac.jp',
          principal_name: '佐藤花子',
          student_count: 800,
          teacher_count: 45,
          user_count: 845,
          is_active: true,
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z'
        },
        {
          id: 3,
          name: 'デモ小学校',
          type: 'elementary',
          prefecture: '神奈川県',
          city: '横浜市',
          phone: '045-1234-5678',
          email: 'info@demo-elementary.ac.jp',
          principal_name: '山田次郎',
          student_count: 600,
          teacher_count: 30,
          user_count: 630,
          is_active: false,
          created_at: '2024-01-25T10:00:00Z',
          updated_at: '2024-01-25T10:00:00Z'
        }
      ];

      setSchools(mockSchools);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.principal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || school.type === typeFilter;
    const matchesPrefecture = prefectureFilter === 'all' || school.prefecture === prefectureFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && school.is_active) ||
      (statusFilter === 'inactive' && !school.is_active);

    return matchesSearch && matchesType && matchesPrefecture && matchesStatus;
  });

  const totalStudents = schools.reduce((sum, school) => sum + school.student_count, 0);
  const totalTeachers = schools.reduce((sum, school) => sum + school.teacher_count, 0);
  const totalUsers = schools.reduce((sum, school) => sum + school.user_count, 0);
  const activeSchools = schools.filter(school => school.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#FF7F50' }}></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#2F1B14' }}>
              学校管理
            </h1>
            <p className="mt-2 text-lg" style={{ color: '#8B4513' }}>
              システム内の学校の管理・設定
            </p>
          </div>
          <Button
            onClick={() => router.push('/admin/schools/create')}
            style={{ backgroundColor: THEME_COLORS.primary, color: 'white' }}
          >
            新しい学校を作成
          </Button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card style={{ borderColor: '#DEB887' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium" style={{ color: '#8B4513' }}>
                  総学校数
                </p>
                <p className="text-2xl font-bold" style={{ color: '#2F1B14' }}>
                  {schools.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: '#DEB887' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium" style={{ color: '#8B4513' }}>
                  アクティブ学校
                </p>
                <p className="text-2xl font-bold" style={{ color: '#2F1B14' }}>
                  {activeSchools}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: '#DEB887' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium" style={{ color: '#8B4513' }}>
                  総生徒数
                </p>
                <p className="text-2xl font-bold" style={{ color: '#2F1B14' }}>
                  {totalStudents.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: '#DEB887' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium" style={{ color: '#8B4513' }}>
                  総ユーザー数
                </p>
                <p className="text-2xl font-bold" style={{ color: '#2F1B14' }}>
                  {totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <Card className="mb-6" style={{ borderColor: '#DEB887' }}>
        <CardHeader>
          <CardTitle style={{ color: '#2F1B14' }}>フィルター・検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="search">検索</Label>
              <Input
                id="search"
                placeholder="学校名、校長名、メールアドレス"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type-filter">学校種別</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="elementary">小学校</SelectItem>
                  <SelectItem value="junior_high">中学校</SelectItem>
                  <SelectItem value="high_school">高等学校</SelectItem>
                  <SelectItem value="university">大学</SelectItem>
                  <SelectItem value="vocational">専門学校</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prefecture-filter">都道府県</Label>
              <Select value={prefectureFilter} onValueChange={setPrefectureFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="都道府県を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {PREFECTURES.map(prefecture => (
                    <SelectItem key={prefecture} value={prefecture}>
                      {prefecture}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">ステータス</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">アクティブ</SelectItem>
                  <SelectItem value="inactive">非アクティブ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setPrefectureFilter('all');
                  setStatusFilter('all');
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

      {/* 学校一覧 */}
      <Card style={{ borderColor: '#DEB887' }}>
        <CardHeader>
          <CardTitle style={{ color: '#2F1B14' }}>
            学校一覧 ({filteredSchools.length}校)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: '#DEB887' }}>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>学校名</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>種別</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>所在地</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>校長名</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>生徒数</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>ユーザー数</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>ステータス</th>
                  <th className="text-left py-3 px-4" style={{ color: '#8B4513' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map(school => (
                  <tr key={school.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#DEB887' }}>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium" style={{ color: '#2F1B14' }}>{school.name}</p>
                        <p className="text-sm text-gray-600">ID: {school.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {SCHOOL_TYPE_LABELS[school.type as keyof typeof SCHOOL_TYPE_LABELS]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4" style={{ color: '#2F1B14' }}>
                      {school.prefecture}{school.city}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#2F1B14' }}>
                      {school.principal_name}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#2F1B14' }}>
                      {school.student_count.toLocaleString()}名
                    </td>
                    <td className="py-3 px-4" style={{ color: '#2F1B14' }}>
                      {school.user_count.toLocaleString()}名
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={school.is_active ? 'default' : 'secondary'}>
                        {school.is_active ? 'アクティブ' : '非アクティブ'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/admin/schools/${school.id}`)}
                          style={{ backgroundColor: '#FF7F50', color: 'white' }}
                        >
                          詳細
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/invite_user?school=${school.id}`)}
                          style={{ borderColor: '#DEB887', color: '#8B4513' }}
                        >
                          招待
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSchools.length === 0 && (
              <div className="text-center py-8">
                <p style={{ color: '#8B4513' }}>
                  {searchTerm || typeFilter !== 'all' || prefectureFilter !== 'all' || statusFilter !== 'all'
                    ? '検索条件に一致する学校が見つかりません'
                    : '学校が登録されていません'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
