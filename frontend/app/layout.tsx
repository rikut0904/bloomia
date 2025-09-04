import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/AuthContext"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bloomia - 中学校向け統合学習・公務支援システム",
  description: "中学生の学びたい気持ちを育み、教師の教育活動と公務業務を統合的に支援するプラットフォーム",
  generator: "Bloomia",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`} style={{backgroundColor: '#fdf8f0', minHeight: '100vh'}}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
