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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithSchoolId } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!schoolId.trim()) {
        setError('学校IDを入力してください');
        return;
      }
      await signInWithSchoolId(email, password, schoolId);
      router.push('/home');
    } catch (error: any) {
      setError(error.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="schoolId">学校ID</Label>
                <Input
                  id="schoolId"
                  type="text"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  placeholder="例: school001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
                style={{ backgroundColor: '#FF7F50', color: 'white' }}
              >
{loading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>

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
