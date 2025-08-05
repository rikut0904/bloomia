'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth-service';

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // 認証状態をチェック
    const checkAuth = async () => {
      const { isAuthenticated } = await authService.checkAuthStatus();
      if (isAuthenticated) {
        router.push('/home');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.login();
    } catch (error) {
      console.error('ログインエラー:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">認証中...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Bloomia</h1>
            <p className="text-gray-600 dark:text-gray-400">学びが花開く場所</p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                アカウントにログインして学習を始めましょう
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🔐</span>
              ログイン
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                初めての方は、ログイン時にアカウントが自動的に作成されます
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}