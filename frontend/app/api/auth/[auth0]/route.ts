import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

// Check if Auth0 is enabled
const isAuth0Enabled = process.env.AUTH0_ISSUER_BASE_URL && 
                      process.env.AUTH0_ISSUER_BASE_URL.length > 0 && 
                      process.env.AUTH0_SECRET && 
                      process.env.AUTH0_SECRET.length > 0;

export const GET = async (request: NextRequest, { params }: { params: { auth0: string } }) => {
  // If Auth0 is disabled, provide mock authentication
  if (!isAuth0Enabled) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    if (pathname.includes('/login')) {
      // Mock login - redirect to home with mock user
      const response = NextResponse.redirect(new URL(`${process.env.AUTH0_BASE_URL}/home`, request.url));
      response.cookies.set('mock-user', JSON.stringify({
        sub: 'mock-user-123',
        name: 'テストユーザー',
        email: 'test@example.com',
        picture: 'https://via.placeholder.com/150'
      }));
      return response;
    } else if (pathname.includes('/logout')) {
      // Mock logout - clear cookies and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('mock-user');
      return response;
    } else if (pathname.includes('/callback')) {
      // Mock callback - redirect to home
      return NextResponse.redirect(new URL(`${process.env.AUTH0_BASE_URL}/home`, request.url));
    } else if (pathname.includes('/me')) {
      // Mock profile endpoint
      const mockUser = {
        sub: 'mock-user-123',
        name: 'テストユーザー',
        email: 'test@example.com',
        picture: 'https://via.placeholder.com/150'
      };
      return NextResponse.json(mockUser);
    }
    
    // Default response for other auth routes
    return NextResponse.json({ error: 'Auth0 disabled' }, { status: 404 });
  }
  
  // Use Auth0 if enabled
  return handleAuth({
    login: handleLogin({
      returnTo: `${process.env.AUTH0_BASE_URL}/home`,
      authorizationParams: {
        prompt: 'login',           // 強制的にログイン画面を表示
        max_age: '0'               // キャッシュされた認証を無効化
      }
    }),
    logout: handleLogout({
      returnTo: `${process.env.AUTH0_BASE_URL}/login`,
      logoutParams: {
        federated: true    // Auth0のセッションも完全にクリア
      }
    })
  })(request, { params });
};