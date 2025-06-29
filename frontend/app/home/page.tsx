'use client';

import '@/styles/app.css';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/home/login');
    }
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, [status]);

  const toggleTheme = () => {
    const nowDark = !darkMode;
    document.documentElement.classList.toggle('dark', nowDark);
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    setDarkMode(nowDark);
  };

  const features = [
    { title: '教科書', href: '/home/textbook' },
    { title: 'ノート', href: '/home/note' },
    { title: '課題', href: '/home/work' },
    { title: '成績', href: '/home/grades' },
    { title: '資料作成', href: '/home/materials' },
    { title: 'チャット', href: '/home/chat' },
    { title: 'ToDo', href: '/home/todo' },
    { title: 'Code', href: '/home/code' },
  ];

  return (
    <main className="min-h-screen p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Bloomia</h1>
        <div className="flex gap-3">
          <button onClick={toggleTheme} className="text-xl">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => signOut({ callbackUrl: '/home/login' })} className="bg-red-600 text-white px-3 py-1 rounded">
            ログアウト
          </button>
        </div>
      </header>

      <section className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="bg-primary-light dark:bg-gray-800 p-4 rounded-md w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-2">本日のタスク</h2>
          <ul className="text-sm list-disc list-inside">
            <li>国語の予習</li>
            <li>数学の課題提出</li>
            <li>プログラミング演習</li>
          </ul>
        </div>

        <div className="bg-gray-400 dark:bg-gray-800 px-4 py-2 rounded-md w-full md:w-1/2 flex items-center gap-2 text-white">
          🔍
          <input
            type="text"
            placeholder="教材を検索する"
            className="bg-transparent w-full outline-none placeholder-white"
          />
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((f) => (
          <Link key={f.href} href={f.href}>
            <div className="bg-primary-light dark:bg-gray-800 p-6 text-center rounded-lg shadow hover:shadow-lg cursor-pointer transition">
              <div className="text-lg font-semibold">{f.title}</div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
