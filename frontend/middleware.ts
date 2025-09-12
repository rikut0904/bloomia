import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes protection
  if (pathname.startsWith('/api/v1/admin/') ||
    pathname.startsWith('/api/v1/courses/') ||
    pathname.startsWith('/api/v1/assignments/')) {

    // Check for Firebase ID token in Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Verify Firebase ID token
    // const idToken = authHeader.substring(7);
    // const decodedToken = await admin.auth().verifyIdToken(idToken);

    // For now, let the request proceed and handle auth in the API routes
  }

  // Admin pages protection (client-side with useAuth hook)
  if (pathname.startsWith('/admin/')) {
    // Let client-side auth handle this
    return NextResponse.next();
  }

  // Protected user areas
  if (pathname.startsWith('/home/')) {
    // Let client-side auth handle this
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/home/:path*',
    '/api/v1/admin/:path*',
    '/api/v1/courses/:path*',
    '/api/v1/assignments/:path*',
    '/api/v1/grades/:path*',
    '/api/v1/attendance/:path*',
    '/api/v1/chat/:path*',
    '/api/v1/whiteboard/:path*',
    '/api/v1/notes/:path*'
  ]
};