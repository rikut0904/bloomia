'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UserStats {
  admin: number;
  school_admin: number;
  teacher: number;
  student: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      // const response = await fetch('/api/v1/admin/stats');
      // const data = await response.json();
      // setStats(data.stats);

      // モックデータ
      setStats({
        admin: 2,
        school_admin: 5,
        teacher: 120,
        student: 2400,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
          管理者ダッシュボード
        </h1>
        <p className="mt-2 text-lg" style={{ color: '#8B4513' }}>
          システム全体の統計情報とユーザー管理
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-white shadow-sm" style={{ borderColor: '#DEB887' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#8B4513' }}>
              システム管理者
            </CardTitle>
            <div className="text-2xl">👑</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#2F1B14' }}>
              {stats?.admin || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm" style={{ borderColor: '#DEB887' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#8B4513' }}>
              学校管理者
            </CardTitle>
            <div className="text-2xl">🏫</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#2F1B14' }}>
              {stats?.school_admin || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm" style={{ borderColor: '#DEB887' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#8B4513' }}>
              教員
            </CardTitle>
            <div className="text-2xl">👩‍🏫</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#2F1B14' }}>
              {stats?.teacher || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm" style={{ borderColor: '#DEB887' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#8B4513' }}>
              生徒
            </CardTitle>
            <div className="text-2xl">👨‍🎓</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#2F1B14' }}>
              {stats?.student || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 管理機能へのクイックリンク */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
              style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-xl">👥</span>
              <span style={{ color: '#2F1B14' }}>ユーザー管理</span>
            </CardTitle>
            <CardDescription style={{ color: '#8B4513' }}>
              ユーザーの役割変更・権限管理・承認状況の管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/admin/users" className="text-sm font-medium block" style={{ color: '#FF7F50' }}>
                ユーザー一覧を見る →
              </a>
              <a href="/admin/invite" className="text-sm font-medium block" style={{ color: '#FF7F50' }}>
                新しいユーザーを招待 →
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-xl">🏫</span>
              <span style={{ color: '#2F1B14' }}>学校管理</span>
            </CardTitle>
            <CardDescription style={{ color: '#8B4513' }}>
              学校情報の管理・設定・新規学校の追加
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/schools" className="text-sm font-medium" style={{ color: '#FF7F50' }}>
              学校一覧を見る →
            </a>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderColor: '#DEB887' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-xl">📊</span>
              <span style={{ color: '#2F1B14' }}>システム統計</span>
            </CardTitle>
            <CardDescription style={{ color: '#8B4513' }}>
              利用状況・パフォーマンス・エラー統計の確認
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-sm font-medium" style={{ color: '#8B4513' }}>
              近日実装予定
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}