'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/app.css';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Firebase AuthのuseAuthフックを使用
  const { user: firebaseUser, loading: firebaseLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ユーザーとダッシュボードデータの状態管理
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // APIからダッシュボードデータを取得
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard?uid=${firebaseUser?.uid}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setUser(data.user);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  // ユーザー同期を実行
  const syncUser = async () => {
    try {
      const response = await fetch('/api/auth/sync', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser?.uid,
          email: firebaseUser?.email,
          displayName: firebaseUser?.displayName,
          schoolId: 'default-school', // デフォルトスクールID
          role: 'user' // デフォルトロール
        })
      });
      if (response.ok) {
        const syncData = await response.json();
        console.log('User synced:', syncData);
      }
    } catch (error) {
      console.error('User sync error:', error);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    console.log('Home page state:', {
      firebaseLoading,
      firebaseUser: !!firebaseUser,
      user: !!user,
      isLoading,
      firebaseUserDetails: firebaseUser ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName
      } : null
    });

    if (firebaseUser && !firebaseLoading) {
      console.log('Firebase user authenticated, syncing data...');
      // Firebaseユーザーが認証済みの場合
      const syncAndFetchData = async () => {
        try {
          await syncUser(); // PostgreSQLに同期
          await fetchDashboardData(); // ダッシュボードデータを取得
          console.log('User sync and data fetch completed');
        } catch (error) {
          console.error('Error during user sync or data fetch:', error);
        } finally {
          setIsLoading(false);
        }
      };
      syncAndFetchData();
    } else if (!firebaseLoading && !firebaseUser) {
      // 未認証の場合
      console.log('No Firebase user found, setting loading to false');
      setIsLoading(false);
    }
  }, [mounted, firebaseUser, firebaseLoading]);

  useEffect(() => {
    if (!mounted) return;
    
    const saved = localStorage.getItem('theme');
    const nowDark = saved === 'dark';
    if (nowDark) document.documentElement.classList.add('dark');
    setDarkMode(nowDark);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    // Firebase認証の場合は、firebaseLoadingが完了してからリダイレクト判定
    // 一時的にリダイレクトを無効化してデバッグ
    if (!firebaseLoading && !firebaseUser) {
      console.log('No Firebase user found, but not redirecting for debugging');
      // router.push('/login');
    }
  }, [firebaseUser, firebaseLoading, router, mounted]);

  const toggleTheme = () => {
    const next = !darkMode;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setDarkMode(next);
  };

  const row1Items = [
    { title: '教科書', href: '/home/textbook', icon: '📚' },
    { title: 'ノート', href: '/home/note', icon: '📝' },
    { title: '課題', href: '/home/work', icon: '📋' },
  ];

  const row2Items = [
    { title: '成績', href: '/home/grades', icon: '📊' },
    { title: '資料作成', href: '/home/materials', icon: '📄' },
    { title: 'チャット', href: '/home/chat', icon: '💬' },
    { title: 'ToDo', href: '/home/todo', icon: '✅' },
    { title: 'Code', href: '/home/code', icon: '💻' },
  ];

  // Show loading until mounted and user is determined
  if (!mounted || firebaseLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#fdf8f0'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#FF7F50'}}></div>
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証されていないユーザーでもページを表示（デバッグ用）
  if (!user && !firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#fdf8f0'}}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{color: '#FF7F50'}}>Bloomia</h1>
          <p className="text-lg mb-4">認証されていません</p>
          <p className="text-sm text-gray-600 mb-4">Firebase認証の状態を確認中...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{borderColor: '#FF7F50'}}></div>
          <p className="text-sm">firebaseLoading: {firebaseLoading ? 'true' : 'false'}</p>
          <p className="text-sm">firebaseUser: {firebaseUser ? 'authenticated' : 'not authenticated'}</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--background)', color: 'var(--text-primary)' }}
    >
      {/* README準拠のテーマ変数 */}
      <style>{`
        :root {
          /* メインカラー（コーラル） */
          --primary: #FF7F50;
          --primary-light: #FFB07A;
          --primary-dark: #E55A2B;

          /* セカンダリ・アクセント */
          --secondary: #20B2AA;
          --secondary-light: #48D1CC;
          --secondary-dark: #008B8B;
          --accent: #FFD700;
          --accent-light: #FFEC8C;
          --accent-dark: #DAA520;

          /* 状態色 */
          --success: #32CD32;
          --warning: #FFA500;
          --error: #DC143C;
          --info: #4682B4;

          /* 背景・テキスト・枠線・影 */
          --background: #fdf8f0;
          --surface: #FFFFFF;
          --text-primary: #2F1B14;
          --text-secondary: #8B4513;
          --border: #DEB887;
          --shadow: rgba(255,127,80,0.2);
        }
        /* ダークは可読性を優先した暫定値（READMEベース） */
        .dark {
          --background: #0F172A;
          --surface: #1E293B;
          --text-primary: #E5E7EB;
          --text-secondary: #C7D2FE;
          --border: #334155;
          --shadow: rgba(0,0,0,0.25);
          --primary: #FF7F50;
          --primary-light: #FFB07A;
          --primary-dark: #E55A2B;
        }
      `}</style>

      {/* Header */}
      <header
        className="flex justify-between items-center p-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
          Bloomia
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-right mr-4">
            <p className="font-medium" style={{color: 'var(--text-primary)'}}>
              {user?.name || user?.email || 'ゲスト'}
            </p>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
              {dashboardData?.user?.role === 'student' ? `${dashboardData.user.grade}年生` : 
               dashboardData?.user?.role === 'teacher' ? '先生' :
               'ようこそ'}
            </p>
          </div>
          {user?.avatar_url && (
            <img 
              src={user.avatar_url} 
              alt="プロフィール" 
              className="w-8 h-8 rounded-full"
            />
          )}
          <button
            onClick={toggleTheme}
            className="text-xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            title={darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <Button
            onClick={async () => {
              // Firebase Authのログアウト処理
              try {
                const { logout } = await import('@/lib/auth');
                await logout();
                window.location.href = '/login';
              } catch (error) {
                console.error('Logout error:', error);
                window.location.href = '/login';
              }
            }}
            className="text-white hover:opacity-90"
            style={{backgroundColor: 'var(--primary)'}}
          >
            ログアウト
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col lg:flex-row p-4 gap-6">
        {/* Left: tasks */}
        <aside
          className="w-full lg:w-1/4 rounded-lg shadow-sm p-6"
          style={{
            background: 'var(--surface)',
            boxShadow: '0 4px 16px var(--shadow)',
            border: '1px solid var(--border)',
          }}
        >
          <h2 className="text-lg font-semibold mb-4">本日のタスク</h2>
          <ul
            className="rounded-lg p-4 space-y-3"
            style={{ background: 'var(--surface)' }}
          >
            {dashboardData?.tasks?.map((task: any, index: number) => (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                <span 
                  className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                />
                {task.title}
                {task.due_date && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </li>
            )) || (
              // フォールバック表示
              <>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  タスクを読み込み中...
                </li>
              </>
            )}
          </ul>
        </aside>

        {/* Right: search + top modules */}
        <section className="w-full lg:w-3/4 flex flex-col gap-6">
          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log('検索:', searchQuery);
            }}
            className="relative"
          >
            <div
              className="p-4 rounded-lg flex items-center gap-3"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 12px var(--shadow)',
              }}
            >
              <span className="text-xl">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="教材を検索する"
                className="bg-transparent outline-none w-full placeholder-gray-600 dark:placeholder-gray-400 text-lg"
                aria-label="教材検索"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded transition-colors text-white shadow"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  boxShadow: '0 8px 20px var(--shadow)',
                  border: 'none',
                }}
              >
                検索
              </button>
            </div>
          </form>

          {/* Top row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {row1Items.map((item) => (
              <Link key={item.title} href={item.href} className="block">
                <div
                  className="p-6 text-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    color: '#fff',
                    boxShadow: '0 4px 12px var(--shadow)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold">{item.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom row */}
      <section className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {row2Items.map((item) => (
            <Link key={item.title} href={item.href} className="block">
              <div
                className="p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  color: '#fff',
                  boxShadow: '0 4px 12px var(--shadow)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-medium text-sm">{item.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}