import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { PasswordService } from '../security/password.service.js';
import { UsersService } from '../users/users.service.js';
import { SessionService } from './session.service.js';

import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
  ) {}

  async register(input: RegisterDto) {
    const existingUser = await this.usersService.findByEmailForAuthentication(input.email);

    if (existingUser) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists',
      });
    }

    const passwordHash = await this.passwordService.hash(input.password);

    const organizationSlug = this.createOrganizationSlug(input.organizationName);

    const user = await this.usersService.createWithOrganization({
      email: input.email,
      name: input.name,
      passwordHash,
      organizationName: input.organizationName,
      organizationSlug,
    });

    const sessionId = await this.sessionService.create(user.id);

    return {
      user,
      sessionId,
    };
  }

  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);

    const sessionId = await this.sessionService.create(user.id);

    return {
      user,
      sessionId,
    };
  }

  async getCurrentUser(sessionId?: string) {
    if (!sessionId) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const session = await this.sessionService.find(sessionId);

    if (!session) {
      throw new UnauthorizedException({
        code: 'INVALID_SESSION',
        message: 'Session is invalid or expired',
      });
    }

    const user = await this.usersService.findAuthenticatedUser(session.userId);

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_SESSION',
        message: 'Session is invalid or expired',
      });
    }

    return user;
  }

  async logout(sessionId?: string): Promise<void> {
    if (!sessionId) {
      return;
    }

    await this.sessionService.destroy(sessionId);
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.usersService.findByEmailForAuthentication(email);

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await this.passwordService.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  private createOrganizationSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
