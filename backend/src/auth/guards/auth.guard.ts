import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from '../auth.service.js';
import { SESSION_COOKIE_NAME } from '../constants/session.constants.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.type.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const sessionId = request.cookies?.[SESSION_COOKIE_NAME];

    const user = await this.authService.getCurrentUser(sessionId);

    (request as AuthenticatedRequest).user = user;

    return true;
  }
}
