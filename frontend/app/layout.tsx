import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { MockUserProvider } from '@/lib/mock-auth'
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
  // Check if Auth0 is enabled
  const isAuth0Enabled = process.env.AUTH0_ISSUER_BASE_URL && process.env.AUTH0_ISSUER_BASE_URL.length > 0;

  return (
    <html lang="ja">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`} style={{backgroundColor: '#fdf8f0', minHeight: '100vh'}}>
        {isAuth0Enabled ? (
          <UserProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <Analytics />
          </UserProvider>
        ) : (
          <MockUserProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <Analytics />
          </MockUserProvider>
        )}
      </body>
    </html>
  )
}
