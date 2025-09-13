'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// モック用のStatCardコンポーネント
const StatCard = ({ title, value }: { title: string; value: number }) => (
  <Card className="p-6">
    <div className="text-2xl font-bold text-primary mb-2">{value}</div>
    <div className="text-sm text-muted-foreground">{title}</div>
  </Card>
);

// モック用のLoadingPageコンポーネント
const LoadingPage = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary"></div>
      <p className="text-lg">{message}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();

  // モックデータ
  const [stats] = useState({
    total_users: 1250,
    admin: 5,
    school_admin: 25,
    teacher: 180,
    student: 1040,
    total_schools: 12,
    active_schools: 10,
    total_students: 1040
  });

  // モック認証状態（常に認証済みとして扱う）
  const authLoading = false;
  const loading = false;
  const isAuthorized = true;

  if (authLoading || loading) {
    return <LoadingPage message="管理者ダッシュボードを読み込み中..." />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">
          管理者ダッシュボード
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          システム全体の統計情報とユーザー管理
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="総ユーザー数" value={stats?.total_users || 0} />
        <StatCard title="システム管理者" value={stats?.admin || 0} />
        <StatCard title="学校管理者" value={stats?.school_admin || 0} />
        <StatCard title="教員数" value={stats?.teacher || 0} />
        <StatCard title="生徒数" value={stats?.student || 0} />
        <StatCard title="総学校数" value={stats?.total_schools || 0} />
        <StatCard title="アクティブ学校" value={stats?.active_schools || 0} />
        <StatCard title="総学生数" value={stats?.total_students || 0} />
      </div>

      {/* 管理機能へのクイックリンク */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>ユーザー管理</CardTitle>
            <CardDescription>システム内のユーザーの管理と権限設定</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/event/admin/users')}
                className="w-full justify-start"
                variant="ghost"
              >
                ユーザー一覧
              </Button>
              <Button
                onClick={() => router.push('/event/admin/users/create')}
                className="w-full justify-start"
                variant="ghost"
              >
                新規ユーザー作成
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>学校管理</CardTitle>
            <CardDescription>学校情報の管理と設定</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/event/admin/schools')}
                className="w-full justify-start"
                variant="ghost"
              >
                学校一覧
              </Button>
              <Button
                onClick={() => router.push('/event/admin/schools/create')}
                className="w-full justify-start"
                variant="ghost"
              >
                新規学校登録
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>システム統計</CardTitle>
            <CardDescription>詳細な統計情報と分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/event/admin/stats')}
                className="w-full justify-start"
                variant="ghost"
              >
                詳細統計
              </Button>
              <Button
                onClick={() => router.push('/event/admin/reports')}
                className="w-full justify-start"
                variant="ghost"
              >
                レポート
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}