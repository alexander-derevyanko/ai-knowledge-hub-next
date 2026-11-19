import type { AuthService } from '../auth.service.js';

export type AuthenticatedUser = NonNullable<Awaited<ReturnType<AuthService['getCurrentUser']>>>;
