'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-3xl">🌸</span>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">Bloomia</CardTitle>
              <CardDescription className="text-lg mt-2">中学校向け学習・公務支援システム</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-6">学校アカウントでログインしてください</p>

              {/* Auth0 Login Button - This will be connected to Auth0 later */}
              <Button
                size="lg"
                className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link href="/api/auth/login">学校アカウントでログイン</Link>
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">アカウントをお持ちでない場合は</p>
              <Link
                href="/contact"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                お問い合わせください
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
