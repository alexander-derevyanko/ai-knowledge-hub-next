import type { LoginCredentials, RegisterCredentials, RegisterResponse, User } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiErrorDetail {
  field: string;
  messages: string[];
}

interface ApiErrorResponse {
  message?: string | string[];
  details?: ApiErrorDetail[];
}

async function getErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;

  if (!body) {
    return `Request failed with status ${response.status}`;
  }

  const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;

  const details = body.details
    ?.flatMap(({ field, messages }) => messages.map((item) => `${field}: ${item}`))
    .join('; ');

  if (message && details) {
    return `${message}: ${details}`;
  }

  if (message) {
    return message;
  }

  return `Request failed with status ${response.status}`;
}

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
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as TResponse;
}

export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  return postJson<RegisterCredentials, RegisterResponse>('/auth/register', credentials);
}

export async function login(credentials: LoginCredentials): Promise<void> {
  await postJson<LoginCredentials, unknown>('/auth/login', credentials, 'include');
}

export async function logout(): Promise<void> {
  // TODO: Implement API integration.
  throw new Error('Not implemented');
}

export async function getCurrentUser(): Promise<User | null> {
  // TODO: Implement API integration.
  throw new Error('Not implemented');
}
