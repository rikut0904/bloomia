'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth-service';

export default function AdminLoginPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.login();
    } catch (error) {
      console.error('ログインエラー:', error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Bloomia 管理者</h1>
            <p className="text-gray-600 dark:text-gray-400">管理者専用ログイン</p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                管理者アカウントでログインしてください
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🔐</span>
              {isLoading ? '認証中...' : '管理者ログイン'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                管理者権限が必要です
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}