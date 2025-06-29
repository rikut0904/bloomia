"use client";

import { signIn } from "next-auth/react";
import React from "react";

export default function LoginPage() {
  return (
    <main className="app-main">
      <h1 className="text-3xl font-bold mb-8">ログイン</h1>
      <button
        onClick={() => signIn("google", { callbackUrl: "/admin" })}
        className="app-link"
      >
        Googleでログイン
      </button>
    </main>
  );
}
