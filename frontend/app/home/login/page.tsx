"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="app-main">
      <h1 className="text-3xl font-bold mb-8">ログイン</h1>
      <button
        onClick={() => signIn("google", { callbackUrl: "/home" })}
        className="app-link"
      >
        Googleでログイン
      </button>
    </main>
  );
}
