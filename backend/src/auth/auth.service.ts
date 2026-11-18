import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { PasswordService } from '../security/password.service.js';
import { UsersService } from '../users/users.service.js';

import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly usersService: UsersService,
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

    return this.usersService.createWithOrganization({
      email: input.email,
      name: input.name,
      passwordHash,
      organizationName: input.organizationName,
      organizationSlug,
    });
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
