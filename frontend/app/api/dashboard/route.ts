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

// ダッシュボードデータを取得
export async function GET(request: NextRequest) {
  try {
    // Firebase IDトークンをヘッダーから取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // バックエンドAPIからダッシュボードデータを取得
    const url = new URL(request.url);
    const firebaseUid = url.searchParams.get('uid');
    
    if (!firebaseUid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const backendUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/v1/dashboard?uid=${firebaseUid}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Dashboard data not found' }, { status: response.status });
    }

    const dashboardData = await response.json();
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
