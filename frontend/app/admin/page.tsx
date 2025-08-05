'use client';

import '@/styles/app.css';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth-service';

export default function AdminPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { isAuthenticated, user } = await authService.checkAuthStatus();
                if (!isAuthenticated) {
                    router.push('/admin/login');
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
                <h1 className="text-2xl font-bold text-primary">Bloomia 管理者</h1>
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

            {/* 管理者ダッシュボード */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 統計カード */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">ユーザー統計</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>総ユーザー数</span>
                                <span className="font-bold">1,234</span>
                            </div>
                            <div className="flex justify-between">
                                <span>アクティブユーザー</span>
                                <span className="font-bold text-green-600">892</span>
                            </div>
                            <div className="flex justify-between">
                                <span>新規登録（今月）</span>
                                <span className="font-bold text-blue-600">45</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">コンテンツ管理</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>教材数</span>
                                <span className="font-bold">567</span>
                            </div>
                            <div className="flex justify-between">
                                <span>課題数</span>
                                <span className="font-bold">234</span>
                            </div>
                            <div className="flex justify-between">
                                <span>コース数</span>
                                <span className="font-bold">89</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">システム状況</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>サーバー状態</span>
                                <span className="font-bold text-green-600">正常</span>
                            </div>
                            <div className="flex justify-between">
                                <span>データベース</span>
                                <span className="font-bold text-green-600">接続中</span>
                            </div>
                            <div className="flex justify-between">
                                <span>最終更新</span>
                                <span className="font-bold text-gray-600">2分前</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* クイックアクション */}
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">クイックアクション</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="bg-primary text-white p-4 rounded-lg hover:bg-primary/90 transition-colors">
                            <div className="text-2xl mb-2">👥</div>
                            <div className="font-semibold">ユーザー管理</div>
                        </button>
                        <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
                            <div className="text-2xl mb-2">📚</div>
                            <div className="font-semibold">教材管理</div>
                        </button>
                        <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="font-semibold">レポート</div>
                        </button>
                        <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors">
                            <div className="text-2xl mb-2">⚙️</div>
                            <div className="font-semibold">設定</div>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}