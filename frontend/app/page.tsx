import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Trophy, MessageSquare, FileText, BarChart3, UserCheck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fdf8f0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#FF7F50]/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FF7F50] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌸</span>
            </div>
            <h1 className="text-2xl font-bold text-[#FF7F50]">Bloomia</h1>
          </div>
          <Button asChild className="bg-[#FF7F50] hover:bg-[#FF7F50]/90">
            <Link href="/login">ログイン</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            中学生の「学びたい」を咲かせるプラットフォーム
          </h2>
          <p className="text-xl text-gray-600 mb-8 text-pretty">
            Bloomiaは中学生の学習意欲を引き出し、教師の教育活動と公務業務を統合的に支援する次世代の学習管理システムです。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-[#FF7F50] hover:bg-[#FF7F50]/90">
              <Link href="/login">今すぐ始める</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#FF7F50] text-[#FF7F50] hover:bg-[#FF7F50]/10 bg-transparent"
            >
              詳細を見る
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">主な機能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="border-[#FF7F50]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-[#FF7F50] mb-2" />
                <CardTitle className="text-[#FF7F50]">教材管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>デジタル教材の作成・配布・管理を効率化</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-[#FF7F50]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="w-8 h-8 text-[#FF7F50] mb-2" />
                <CardTitle className="text-[#FF7F50]">課題管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>課題の作成・配布・提出・採点を一元管理</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-[#FF7F50]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-[#FF7F50] mb-2" />
                <CardTitle className="text-[#FF7F50]">成績管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>学習進捗と成績を可視化・分析</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-[#FF7F50]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="w-8 h-8 text-[#FF7F50] mb-2" />
                <CardTitle className="text-[#FF7F50]">チャット</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>生徒と教師のリアルタイムコミュニケーション</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-[#FF7F50]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="w-8 h-8 text-[#FF7F50] mb-2" />
                <CardTitle className="text-[#FF7F50]">ノート</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>デジタルノート機能で学習記録を管理</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-[#FF7F50]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-8 h-8 text-[#FF7F50] mb-2" />
                <CardTitle className="text-[#FF7F50]">ホワイトボード</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>協働学習のための共有ホワイトボード</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-[#FF7F50]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <UserCheck className="w-8 h-8 text-[#FF7F50] mb-2" />
                <CardTitle className="text-[#FF7F50]">出席管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>出席状況の記録と管理を自動化</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-[#FF7F50]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Trophy className="w-8 h-8 text-[#FF7F50] mb-2" />
                <CardTitle className="text-[#FF7F50]">ゲーミフィケーション</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>学習意欲を高めるポイント・バッジシステム</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-[#FF7F50] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌸</span>
            </div>
            <h3 className="text-2xl font-bold">Bloomia</h3>
          </div>
          <p className="text-gray-400 mb-4">中学生の「学びたい」を咲かせるプラットフォーム</p>
          <p className="text-gray-500 text-sm">© 2025 Bloomia Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
