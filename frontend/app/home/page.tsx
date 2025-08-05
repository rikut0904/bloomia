'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth-service';
import Link from 'next/link';
import '@/styles/app.css';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAuthenticated, user } = await authService.checkAuthStatus();
        if (!isAuthenticated) {
          router.push('/home/login');
          return;
        }
        setUser(user);
      } catch (err) {
        setError('認証エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, [router]);

  const toggleTheme = () => {
    const nowDark = !darkMode;
    document.documentElement.classList.toggle('dark', nowDark);
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    setDarkMode(nowDark);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 検索機能の実装
    console.log('検索クエリ:', searchQuery);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">エラーが発生しました</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // リダイレクト中
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* ヘッダー */}
      <header className="flex justify-between items-center p-4 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary">Bloomia</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインレイアウト */}
      <div className="flex flex-col lg:flex-row p-4 gap-6">
        {/* 左：本日のタスク */}
        <aside className="w-full lg:w-1/4 bg-primary-light dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">本日のタスク</h2>
          <ul className="bg-white dark:bg-gray-700 rounded-lg p-4 space-y-3">
            <li className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              国語の予習
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              数学の課題提出
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              プログラミング演習
            </li>
          </ul>
        </aside>

        {/* 右：検索＋メニュー */}
        <section className="w-full lg:w-3/4 flex flex-col gap-6">
          {/* 検索バー */}
          <form onSubmit={handleSearch} className="relative">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center gap-3">
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
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                検索
              </button>
            </div>
          </form>

          {/* 上段メニュー：教科書・ノート・課題 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {row1Items.map((item) => (
              <Link key={item.title} href={item.href}>
                <div className="bg-primary-light dark:bg-gray-800 p-6 text-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold">{item.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 下段メニュー */}
      <section className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {row2Items.map((item) => (
            <Link key={item.title} href={item.href}>
              <div className="bg-primary-light dark:bg-gray-800 p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
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

