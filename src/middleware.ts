import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('workly_user_id')?.value;
  const pathname = request.nextUrl.pathname;

  const protectedRoutes = ['/dashboard', '/workflows', '/executions', '/integrations', '/templates', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // If trying to access protected dashboard routes without login, redirect to /login
  if (isProtectedRoute && !userId) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting auth pages, redirect to /dashboard
  if ((pathname === '/login' || pathname === '/signup') && userId) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workflows/:path*',
    '/executions/:path*',
    '/integrations/:path*',
    '/templates/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};
