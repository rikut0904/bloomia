import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
        });
    } catch (error) {
        return NextResponse.json(
            { status: 'error', error: 'Health check failed' },
            { status: 500 }
        );
    }
}