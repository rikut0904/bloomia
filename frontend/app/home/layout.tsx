"use client";

import "@/styles/app.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-main">
      <SessionProvider>
        {children}
      </SessionProvider>
    </div>
  );
}
