import 'server-only';

import { cookies } from 'next/headers';

export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  return sessionCookie?.value || null;
}

export async function hasSessionCookie(): Promise<boolean> {
  const sessionCookie = await getSessionCookie();

  return sessionCookie !== null;
}
