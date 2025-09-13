import { NextRequest, NextResponse } from 'next/server';

// ユーザー情報をバックエンドAPIに送信して同期
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUid, email, displayName, schoolId, role } = body;

    if (!firebaseUid || !email) {
      return NextResponse.json({ error: 'Firebase UID and email are required' }, { status: 400 });
    }

    // バックエンドの認証同期APIを呼び出し
    const backendUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/v1/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebase_uid: firebaseUid,
        email,
        display_name: displayName,
        school_id: schoolId,
        role
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error || 'Backend sync failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'User sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ユーザー情報を取得
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const firebaseUid = url.searchParams.get('uid');

    if (!firebaseUid) {
      return NextResponse.json({ error: 'Firebase UID is required' }, { status: 400 });
    }

    // バックエンドAPIからユーザー情報を取得
    const backendUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/v1/auth/sync?uid=${firebaseUid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
