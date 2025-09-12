'use client';

import { LoadingPage } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/admin/StatCard';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminStats } from '@/hooks/useAdminStats';
import { THEME_COLORS } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthorized } = useAdminAuth();
  const { stats, loading } = useAdminStats();

  if (authLoading || loading) {
    return <LoadingPage message="管理者ダッシュボードを読み込み中..." />;
  }

  if (!isAuthorized) {
    return null; // useAdminAuthがリダイレクト処理を行う
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: THEME_COLORS.primaryDark }}>
          管理者ダッシュボード
        </h1>
        <p className="mt-2 text-lg" style={{ color: THEME_COLORS.secondary }}>
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
        <Card style={{ borderColor: THEME_COLORS.border }}>
          <CardHeader>
            <CardTitle style={{ color: THEME_COLORS.primaryDark }}>ユーザー管理</CardTitle>
            <CardDescription>システム内のユーザーの管理と権限設定</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/admin/users')}
                className="w-full justify-start"
                variant="ghost"
              >
                ユーザー一覧
              </Button>
              <Button 
                onClick={() => router.push('/admin/users/create')}
                className="w-full justify-start"
                variant="ghost"
              >
                新規ユーザー作成
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: THEME_COLORS.border }}>
          <CardHeader>
            <CardTitle style={{ color: THEME_COLORS.primaryDark }}>学校管理</CardTitle>
            <CardDescription>学校情報の管理と設定</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/admin/schools')}
                className="w-full justify-start"
                variant="ghost"
              >
                学校一覧
              </Button>
              <Button 
                onClick={() => router.push('/admin/schools/create')}
                className="w-full justify-start"
                variant="ghost"
              >
                新規学校登録
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: THEME_COLORS.border }}>
          <CardHeader>
            <CardTitle style={{ color: THEME_COLORS.primaryDark }}>システム統計</CardTitle>
            <CardDescription>詳細な統計情報と分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/admin/stats')}
                className="w-full justify-start"
                variant="ghost"
              >
                詳細統計
              </Button>
              <Button 
                onClick={() => router.push('/admin/reports')}
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