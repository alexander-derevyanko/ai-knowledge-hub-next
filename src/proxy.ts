import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*', '/documents/:path*', '/chat/:path*', '/settings/:path*', '/login'],
};

export default function proxyRequest(request: NextRequest): NextResponse {
  const hasSessionCookie = Boolean(request.cookies.get('session'));
  const { pathname } = request.nextUrl;

  // Unauthenticated users can access the login page.
  if (!hasSessionCookie && pathname === '/login') {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to the login page.
  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect users with a session cookie away from the login page.
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
