'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // モックユーザーデータ
  const [user] = useState({
    displayName: '管理者',
    email: 'admin@example.com',
    role: 'admin'
  });
  const loading = false;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdf8f0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#FF7F50' }}></div>
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ログインページはレイアウトなしで表示
  if (pathname === '/event/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen" style={{ background: '#fdf8f0', color: '#2F1B14' }}>
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b" style={{ borderColor: '#DEB887' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/event/admin" className="flex items-center">
                <span className="text-2xl font-bold" style={{ color: '#FF7F50' }}>
                  Bloomia Admin
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link
                href="/event/admin"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ color: '#8B4513' }}
              >
                ダッシュボード
              </Link>
              <Link
                href="/event/admin/users"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ color: '#8B4513' }}
              >
                ユーザー管理
              </Link>
              <Link
                href="/event/admin/schools"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ color: '#8B4513' }}
              >
                学校管理
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: '#2F1B14' }}>
                  {user.displayName || user.email}
                </p>
                <p className="text-xs" style={{ color: '#8B4513' }}>
                  システム管理者
                </p>
              </div>
              <Button
                onClick={() => {
                  console.log('ログアウト（モック）');
                  router.push('/event/admin/login');
                }}
                variant="outline"
                size="sm"
                style={{ borderColor: '#FF7F50', color: '#FF7F50' }}
              >
                ログアウト
              </Button>
              <Button
                onClick={() => router.push('/event/home')}
                size="sm"
                style={{ backgroundColor: '#FF7F50' }}
              >
                メインに戻る
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}