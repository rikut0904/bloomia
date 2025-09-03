import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

// ダッシュボードデータの型定義
interface DashboardData {
  user: {
    uid: string;
    name: string;
    email: string;
    avatar_url?: string;
    role: string;
    school_id: number;
    class_id?: number;
    grade?: number;
  };
  tasks: Array<{
    id: number;
    title: string;
    type: string;
    priority: string;
    due_date?: string;
  }>;
  stats: {
    assignments_pending: number;
    assignments_completed: number;
    attendance_rate: number;
    points: number;
    rank?: number;
  };
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    type: string;
    created_at: string;
  }>;
  schedule: Array<{
    period: number;
    subject: string;
    teacher: string;
    classroom: string;
  }>;
}

// 学生用ダッシュボードデータを取得
async function getStudentDashboard(user: any): Promise<DashboardData> {
  // 実際の実装ではPostgreSQLから取得
  return {
    user: {
      uid: user.sub,
      name: user.name,
      email: user.email,
      avatar_url: user.picture,
      role: 'student',
      school_id: 1,
      class_id: 101,
      grade: 2
    },
    tasks: [
      {
        id: 1,
        title: '国語の予習',
        type: 'homework',
        priority: 'medium',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 明日
      },
      {
        id: 2,
        title: '数学の課題提出',
        type: 'assignment',
        priority: 'high',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 明後日
      },
      {
        id: 3,
        title: 'プログラミング演習',
        type: 'practice',
        priority: 'low'
      }
    ],
    stats: {
      assignments_pending: 3,
      assignments_completed: 8,
      attendance_rate: 95.2,
      points: 1250,
      rank: 15
    },
    notifications: [
      {
        id: 1,
        title: '新しい課題が追加されました',
        message: '数学の宿題が追加されました。期限は明日です。',
        type: 'assignment',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: '成績が更新されました',
        message: '国語のテスト結果が公開されました。',
        type: 'grade',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2時間前
      }
    ],
    schedule: [
      { period: 1, subject: '国語', teacher: '田中先生', classroom: '2-A教室' },
      { period: 2, subject: '数学', teacher: '佐藤先生', classroom: '2-A教室' },
      { period: 3, subject: '英語', teacher: '鈴木先生', classroom: '英語教室' },
      { period: 4, subject: '理科', teacher: '山田先生', classroom: '理科室' },
      { period: 5, subject: '社会', teacher: '高橋先生', classroom: '2-A教室' },
      { period: 6, subject: 'プログラミング', teacher: '伊藤先生', classroom: 'PC室' }
    ]
  };
}

// 教師用ダッシュボードデータを取得
async function getTeacherDashboard(user: any): Promise<DashboardData> {
  return {
    user: {
      uid: user.sub,
      name: user.name,
      email: user.email,
      avatar_url: user.picture,
      role: 'teacher',
      school_id: 1
    },
    tasks: [
      {
        id: 1,
        title: '2年A組の課題採点',
        type: 'grading',
        priority: 'high',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        title: '来週の授業準備',
        type: 'preparation',
        priority: 'medium'
      },
      {
        id: 3,
        title: '保護者会資料作成',
        type: 'administrative',
        priority: 'low',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1週間後
      }
    ],
    stats: {
      assignments_pending: 15, // 未採点課題数
      assignments_completed: 42, // 採点済み課題数
      attendance_rate: 98.1, // 担当クラスの出席率
      points: 0, // 教師は対象外
    },
    notifications: [
      {
        id: 1,
        title: '新しい提出物があります',
        message: '2年A組から5件の課題提出がありました。',
        type: 'submission',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: '会議の通知',
        message: '明日14:00から職員会議があります。',
        type: 'meeting',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1時間前
      }
    ],
    schedule: [
      { period: 1, subject: '数学(2-A)', teacher: user.name, classroom: '2-A教室' },
      { period: 2, subject: '数学(2-B)', teacher: user.name, classroom: '2-B教室' },
      { period: 3, subject: '空き時間', teacher: '', classroom: '' },
      { period: 4, subject: '数学(1-A)', teacher: user.name, classroom: '1-A教室' },
      { period: 5, subject: '数学(3-C)', teacher: user.name, classroom: '3-C教室' },
      { period: 6, subject: 'HR(2-A)', teacher: user.name, classroom: '2-A教室' }
    ]
  };
}

// ダッシュボードデータを取得
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request, NextResponse.next());
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { user } = session;
    
    // URLパラメータからロールを取得（実際はDBから取得）
    const url = new URL(request.url);
    const role = url.searchParams.get('role') || 'student';
    
    let dashboardData: DashboardData;
    
    // ロール別にダッシュボードデータを取得
    switch (role) {
      case 'teacher':
        dashboardData = await getTeacherDashboard(user);
        break;
      case 'school_admin':
      case 'admin':
        // 管理者用は後で実装
        dashboardData = await getTeacherDashboard(user);
        break;
      default:
        dashboardData = await getStudentDashboard(user);
        break;
    }
    
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}