import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*', '/documents/:path*', '/chat/:path*', '/settings/:path*'],
};

export default function proxyRequest(request: NextRequest): NextResponse {
  const hasSessionCookie = Boolean(request.cookies.get('session')?.value);

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
