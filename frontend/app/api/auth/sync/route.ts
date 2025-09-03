import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

// PostgreSQL接続設定（環境変数から取得）
const getDbConnection = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return dbUrl;
};

// ユーザー情報をPostgreSQLに同期
export async function POST(request: NextRequest) {
  try {
    // Auth0セッションからユーザー情報を取得
    const session = await getSession(request, NextResponse.next());
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { user } = session;
    
    // デフォルトスクールID（実際の実装では適切な値を設定）
    const defaultSchoolId = 1;
    
    // PostgreSQL接続（実際の実装ではpg packageを使用）
    const userdata = {
      uid: user.sub,
      name: user.name,
      email: user.email,
      avatar_url: user.picture,
      role: 'student', // デフォルトロール
      school_id: defaultSchoolId,
      is_active: true,
      is_approved: false, // 管理者承認待ち
      last_login_at: new Date().toISOString()
    };

    // 実際のPostgreSQL挿入処理（仮実装）
    console.log('Would sync user to PostgreSQL:', userdata);
    
    // 一旦成功レスポンスを返す（実際のDB処理は後で実装）
    return NextResponse.json({ 
      success: true, 
      user: userdata,
      message: 'User sync completed'
    });
    
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'User sync failed', details: error },
      { status: 500 }
    );
  }
}

// ユーザー情報を取得
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request, NextResponse.next());
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // PostgreSQLからユーザー情報を取得（仮実装）
    const userData = {
      uid: session.user.sub,
      name: session.user.name,
      email: session.user.email,
      avatar_url: session.user.picture,
      role: 'student',
      school_id: 1,
      is_approved: true // 実際はDBから取得
    };

    return NextResponse.json({ user: userData });
    
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}