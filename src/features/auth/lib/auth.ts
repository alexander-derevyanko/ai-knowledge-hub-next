import 'server-only';

import { cookies } from 'next/headers';

import { getApiErrorMessage } from '@/shared/api/apiError';
import { SESSION_COOKIE_NAME } from '@/shared/constants/auth';

import type { User } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}`,
      },
      cache: 'no-store',
    });
  } catch {
    throw new Error('Unable to connect to the authentication server');
  }

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return (await response.json()) as User;
}
