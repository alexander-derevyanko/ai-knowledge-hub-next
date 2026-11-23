import 'server-only';

import { getApiErrorMessage } from '@/shared/api/apiError';
import { backendFetch } from '@/shared/api/backendClient';

import type { User } from '../types/auth';

export async function getCurrentUser(): Promise<User | null> {
  const response = await backendFetch('/auth/me', {
    method: 'GET',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return (await response.json()) as User;
}
