import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../auth.service.js';
import { SESSION_COOKIE_NAME } from '../constants/session.constants.js';

import { AuthGuard } from './auth.guard.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.type.js';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  let authService: {
    getCurrentUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authService = {
      getCurrentUser: vi.fn(),
    };

    authGuard = new AuthGuard(authService as unknown as AuthService);
  });

  const createExecutionContext = (request: Partial<AuthenticatedRequest>) => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as never;
  };

  it('should authenticate the request and attach user to request', async () => {
    const user = {
      id: 'user-id',
      email: 'john@example.com',
      name: 'John Doe',
      memberships: [
        {
          role: 'OWNER',
          organization: {
            id: 'organization-id',
            name: 'Acme Inc',
            slug: 'acme-inc',
          },
        },
      ],
    };

    const request: Partial<AuthenticatedRequest> = {
      cookies: {
        [SESSION_COOKIE_NAME]: 'session-id',
      },
    };

    authService.getCurrentUser.mockResolvedValue(user);

    const context = createExecutionContext(request);

    const result = await authGuard.canActivate(context);

    expect(authService.getCurrentUser).toHaveBeenCalledWith('session-id');
    expect(request.user).toEqual(user);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if session cookie is missing', async () => {
    const request: Partial<AuthenticatedRequest> = {
      cookies: {},
    };

    authService.getCurrentUser.mockRejectedValue(new UnauthorizedException());

    const context = createExecutionContext(request);

    await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(authService.getCurrentUser).toHaveBeenCalledWith(undefined);
    expect(request.user).toBeUndefined();
  });

  it('should propagate UnauthorizedException if session is invalid', async () => {
    const request: Partial<AuthenticatedRequest> = {
      cookies: {
        [SESSION_COOKIE_NAME]: 'invalid-session',
      },
    };

    authService.getCurrentUser.mockRejectedValue(new UnauthorizedException());

    const context = createExecutionContext(request);

    await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(authService.getCurrentUser).toHaveBeenCalledWith('invalid-session');
    expect(request.user).toBeUndefined();
  });
});
