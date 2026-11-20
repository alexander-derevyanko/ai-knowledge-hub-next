import { getApiErrorMessage } from '@/shared/api/apiError';

import type { LoginCredentials, RegisterCredentials, RegisterResponse } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function postJson<TBody, TResponse>(
  endpoint: string,
  body: TBody,
  credentials: RequestCredentials = 'same-origin',
): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Unable to connect to the authentication server');
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return (await response.json()) as TResponse;
}

export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  return postJson<RegisterCredentials, RegisterResponse>('/auth/register', credentials, 'include');
}

export async function login(credentials: LoginCredentials): Promise<void> {
  await postJson<LoginCredentials, unknown>('/auth/login', credentials, 'include');
}

export async function logout(): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    throw new Error('Unable to connect to the authentication server');
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }
}
