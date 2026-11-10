import 'server-only';

import type { User } from '../types/auth';

export async function getCurrentUser(): Promise<User | null> {
  // TODO:
  // 1. Check whether the session cookie exists.
  // 2. Request the current user from the backend.
  // 3. Return the user or null for 401.

  return null;
}
