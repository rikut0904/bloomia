import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Calendar, MessageSquare, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">おはようございます、田中先生</h1>
        <p className="text-muted-foreground">今日も生徒たちの学びをサポートしましょう</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日の授業</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">5</div>
            <p className="text-xs text-muted-foreground">次の授業: 数学 (10:30)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未採点課題</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">12</div>
            <p className="text-xs text-muted-foreground">期限: 明日まで 3件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新着メッセージ</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">8</div>
            <p className="text-xs text-muted-foreground">保護者から 3件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">出席率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">94.2%</div>
            <p className="text-xs text-muted-foreground">先週比 +2.1%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>今日の予定</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">数学 - 1年A組</p>
                <p className="text-sm text-muted-foreground">10:30 - 11:20</p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>

            <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="font-medium">数学 - 2年B組</p>
                <p className="text-sm text-muted-foreground">11:30 - 12:20</p>
              </div>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">進行中</span>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">職員会議</p>
                <p className="text-sm text-muted-foreground">15:30 - 16:30</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-secondary" />
              <span>要対応事項</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
              <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="font-medium">課題提出期限間近</p>
                <p className="text-sm text-muted-foreground">数学ワークシート - 明日締切</p>
                <p className="text-xs text-secondary mt-1">未提出: 5名</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="font-medium">保護者からの連絡</p>
                <p className="text-sm text-muted-foreground">山田花子さんの保護者より</p>
                <p className="text-xs text-accent mt-1">2時間前</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="font-medium">成績入力締切</p>
                <p className="text-sm text-muted-foreground">中間テスト結果入力</p>
                <p className="text-xs text-muted-foreground mt-1">3日後</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
          <CardDescription>よく使用する機能にすばやくアクセス</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <BookOpen className="w-6 h-6" />
              <span className="text-sm">新しい教材</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Users className="w-6 h-6" />
              <span className="text-sm">課題作成</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm">メッセージ</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">出席確認</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
