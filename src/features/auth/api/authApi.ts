import type { AuthResponse, LoginCredentials, User } from '../types/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // TODO: Implement API integration.
  throw new Error('Not implemented');
}

export async function logout(): Promise<void> {
  // TODO: Implement API integration.
  throw new Error('Not implemented');
}

export async function getCurrentUser(): Promise<User | null> {
  // TODO: Implement API integration.
  throw new Error('Not implemented');
}
