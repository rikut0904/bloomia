import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
    try {
        // バックエンドAPIを呼び出してスキーマ情報を取得
        const backendUrl = `${API_CONFIG.BASE_URL}/api/v1/debug/schema`;
        
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Schema debug error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schema information from backend API' },
            { status: 500 }
        );
    }
}
