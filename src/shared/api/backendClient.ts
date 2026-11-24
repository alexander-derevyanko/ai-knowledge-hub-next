import 'server-only';

import { cookies } from 'next/headers';

import { SESSION_COOKIE_NAME } from '@/shared/constants/auth';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

/**
 * Server-side HTTP client for NestJS.
 * Automatically forwards the current user's HttpOnly session cookie.
 * Next.js → NestJS transport client
 */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!BACKEND_API_URL) {
    throw new Error('BACKEND_API_URL is not configured');
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  const headers = new Headers(init.headers);

  if (sessionCookie && !headers.has('Cookie')) {
    headers.set('Cookie', `${SESSION_COOKIE_NAME}=${sessionCookie.value}`);
  }

  const url = `${BACKEND_API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  try {
    return await fetch(url, {
      ...init,
      headers,
      cache: init.cache ?? 'no-store',
    });
  } catch {
    throw new Error('Unable to connect to the backend server');
  }
}
