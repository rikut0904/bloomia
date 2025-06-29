'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/app.css';

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/home/login');
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

  const row1Items = [
    { title: '教科書', href: '/home/textbook' },
    { title: 'ノート', href: '/home/note' },
    { title: '課題', href: '/home/work' },
  ];

  const row2Items = [
    { title: '成績', href: '/home/grades' },
    { title: '資料作成', href: '/home/materials' },
    { title: 'チャット', href: '/home/chat' },
    { title: 'ToDo', href: '/home/todo' },
    { title: 'Code', href: '/home/code' },
  ];

  return (
    <main className="bg-background text-foreground">
      {/* ヘッダー */}
      <header className="flex justify-between items-center p-4 shadow">
        <h1 className="text-2xl font-bold text-primary">Bloomia</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-xl">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/home/login' })}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* メインレイアウト */}
      <div className="flex flex-col md:flex-row p-4 gap-4">
        {/* 左：本日のタスク */}
        <aside className="w-full md:w-1/4 bg-primary-light dark:bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">本日のタスク</h2>
          <ul className="bg-white list-disc list-inside text-sm space-y-1">
            <li>国語の予習</li>
            <li>数学の課題提出</li>
            <li>プログラミング演習</li>
          </ul>
        </aside>

        {/* 右：検索＋3メニュー */}
        <section className="w-full md:w-3/4 flex flex-col gap-4">
          {/* 検索バー */}
          <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded flex items-center gap-2">
            🔍
            <input
              type="text"
              placeholder="教材を検索する"
              className="bg-transparent outline-none w-full placeholder-gray-600 dark:placeholder-white"
            />
          </div>

          {/* 上段メニュー：教科書・ノート・課題 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {row1Items.map((item) => (
              <Link key={item.title} href={item.href}>
                <div className="bg-primary-light dark:bg-gray-800 p-4 text-center rounded shadow hover:shadow-md transition">
                  {item.title}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <section className='p-4 gap-4'>
        {/* 下に 5つのボタン */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-6">
          {row2Items.map((item) => (
            <Link key={item.title} href={item.href}>
              <div className="bg-primary-light dark:bg-gray-800 p-4 text-center rounded shadow hover:shadow-md transition">
                {item.title}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}