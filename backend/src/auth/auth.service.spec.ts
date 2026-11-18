import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PasswordService } from '../security/password.service.js';
import { UsersService } from '../users/users.service.js';

import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';

describe('AuthService', () => {
  let authService: AuthService;

  let usersService: {
    findByEmailForAuthentication: ReturnType<typeof vi.fn>;
    createWithOrganization: ReturnType<typeof vi.fn>;
  };

  let passwordService: {
    hash: ReturnType<typeof vi.fn>;
    verify: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    usersService = {
      findByEmailForAuthentication: vi.fn(),
      createWithOrganization: vi.fn(),
    };

    passwordService = {
      hash: vi.fn(),
      verify: vi.fn(),
    };

    authService = new AuthService(
      passwordService as unknown as PasswordService,
      usersService as unknown as UsersService,
    );
  });

  describe('register', () => {
    const registerInput: RegisterDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'StrongPassword123!',
      organizationName: 'My Knowledge Hub',
    };

    it('should register a new user with an organization', async () => {
      usersService.findByEmailForAuthentication.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('hashed-password');

      const createdUser = {
        id: 'user-id',
        email: 'john@example.com',
        name: 'John Doe',
      };

      usersService.createWithOrganization.mockResolvedValue(createdUser);

      const result = await authService.register(registerInput);

      expect(usersService.findByEmailForAuthentication).toHaveBeenCalledWith(registerInput.email);

      expect(passwordService.hash).toHaveBeenCalledWith(registerInput.password);

      expect(usersService.createWithOrganization).toHaveBeenCalledWith({
        email: registerInput.email,
        name: registerInput.name,
        passwordHash: 'hashed-password',
        organizationName: registerInput.organizationName,
        organizationSlug: 'my-knowledge-hub',
      });

      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      usersService.findByEmailForAuthentication.mockResolvedValue({
        id: 'existing-user-id',
      });

      await expect(authService.register(registerInput)).rejects.toBeInstanceOf(ConflictException);

      expect(passwordService.hash).not.toHaveBeenCalled();
      expect(usersService.createWithOrganization).not.toHaveBeenCalled();
    });
  });

  describe('validateCredentials', () => {
    const user = {
      id: 'user-id',
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: 'hashed-password',
    };

    it('should return public user data for valid credentials', async () => {
      usersService.findByEmailForAuthentication.mockResolvedValue(user);
      passwordService.verify.mockResolvedValue(true);

      const result = await authService.validateCredentials(user.email, 'StrongPassword123!');

      expect(passwordService.verify).toHaveBeenCalledWith(user.passwordHash, 'StrongPassword123!');

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findByEmailForAuthentication.mockResolvedValue(null);

      await expect(
        authService.validateCredentials('unknown@example.com', 'StrongPassword123!'),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(passwordService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      usersService.findByEmailForAuthentication.mockResolvedValue(user);
      passwordService.verify.mockResolvedValue(false);

      await expect(
        authService.validateCredentials(user.email, 'WrongPassword123!'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
