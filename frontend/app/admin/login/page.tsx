'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInAdmin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInAdmin(email, password);
      router.push('/admin');
    } catch (error: any) {
      setError(error.message || '管理者ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-2 border-red-200">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-red-700">管理者ログイン</CardTitle>
              <CardDescription className="text-lg mt-2 text-red-600">Bloomia 管理者専用</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">管理者メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-red-200 focus:border-red-400"
                />
              </div>

              <div>
                <Label htmlFor="password">管理者パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-red-200 focus:border-red-400"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? '認証中...' : '管理者としてログイン'}
              </Button>
            </form>

            <div className="text-center space-y-2 text-sm text-muted-foreground">
              <p>一般ユーザーの方は</p>
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                こちらからログイン
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