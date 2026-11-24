import { getApiErrorMessage } from '@/shared/api/apiError';

import type { LoginCredentials, RegisterCredentials, RegisterResponse } from '../types/auth';

const AUTH_API_BASE_PATH = '/api/auth';

/**
 * Sends an authentication request through the same-origin Next.js BFF.
 */
async function postJson<TBody, TResponse>(endpoint: string, body: TBody): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${AUTH_API_BASE_PATH}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
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
  return postJson<RegisterCredentials, RegisterResponse>('/register', credentials);
}

export async function login(credentials: LoginCredentials): Promise<void> {
  await postJson<LoginCredentials, unknown>('/login', credentials);
}

export async function logout(): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${AUTH_API_BASE_PATH}/logout`, {
      method: 'POST',
      credentials: 'same-origin',
    });
  } catch {
    throw new Error('Unable to connect to the authentication server');
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }
}
