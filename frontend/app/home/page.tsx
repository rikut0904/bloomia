"use client";

import "@/styles/app.css";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/home/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") return null;

  const features = [
    { title: "教科書", href: "/home/textbook", icon: "📘" },
    { title: "ノート", href: "/home/note", icon: "📝" },
    { title: "コミュニケーション", href: "/home/chat", icon: "💬" },
    { title: "課題", href: "/home/work", icon: "📂" },
    { title: "成績", href: "/home/grades", icon: "📊" },
    { title: "ToDo", href: "/home/todo", icon: "📝" },
    { title: "時間割", href: "/home/schedule", icon: "🕒" },
  ];

  return (
    <div className="app-main">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bloomia</h1>
        <button
          onClick={() => signOut()}
          className="bg-purple-500 text-white px-4 py-2 rounded-md shadow hover:bg-purple-600 transition"
        >
          ログアウト
        </button>
      </header>

      {/* グリッドでカード配置 */}
      <div className="card-grid">
        {features.map((f) => (
          <Link key={f.title} href={f.href} className="card-button">
            <div className="card-icon">{f.icon}</div>
            <span>{f.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
