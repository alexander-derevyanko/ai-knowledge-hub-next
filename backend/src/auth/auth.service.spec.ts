import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PasswordService } from '../security/password.service.js';
import { UsersService } from '../users/users.service.js';

import { AuthService } from './auth.service.js';
import { SessionService } from './session.service.js';
import { RegisterDto } from './dto/register.dto.js';

const REGISTER_DTO: RegisterDto = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  organizationName: 'Acme Inc',
};

const CREATED_USER = {
  id: 'user-id',
  email: REGISTER_DTO.email,
  name: REGISTER_DTO.name,
};

const SESSION_ID = 'session-id';

describe('AuthService', () => {
  let authService: AuthService;

  let usersService: {
    findByEmailForAuthentication: ReturnType<typeof vi.fn>;
    createWithOrganization: ReturnType<typeof vi.fn>;
    findAuthenticatedUser: ReturnType<typeof vi.fn>;
  };

  let passwordService: {
    hash: ReturnType<typeof vi.fn>;
    verify: ReturnType<typeof vi.fn>;
  };

  let sessionService: {
    create: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    usersService = {
      findByEmailForAuthentication: vi.fn(),
      createWithOrganization: vi.fn(),
      findAuthenticatedUser: vi.fn(),
    };

    passwordService = {
      hash: vi.fn(),
      verify: vi.fn(),
    };

    sessionService = {
      create: vi.fn(),
      find: vi.fn(),
      destroy: vi.fn(),
    };

    authService = new AuthService(
      passwordService as unknown as PasswordService,
      usersService as unknown as UsersService,
      sessionService as unknown as SessionService,
    );
  });

  describe('register', () => {
    it('should register a new user, create a session and return both', async () => {
      const passwordHash = 'hashed-password';

      usersService.findByEmailForAuthentication.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue(passwordHash);
      usersService.createWithOrganization.mockResolvedValue(CREATED_USER);
      sessionService.create.mockResolvedValue(SESSION_ID);

      const result = await authService.register(REGISTER_DTO);

      expect(usersService.findByEmailForAuthentication).toHaveBeenCalledWith(REGISTER_DTO.email);

      expect(passwordService.hash).toHaveBeenCalledWith(REGISTER_DTO.password);

      expect(usersService.createWithOrganization).toHaveBeenCalledWith({
        email: REGISTER_DTO.email,
        name: REGISTER_DTO.name,
        passwordHash,
        organizationName: REGISTER_DTO.organizationName,
        organizationSlug: 'acme-inc',
      });

      expect(sessionService.create).toHaveBeenCalledWith(CREATED_USER.id);

      expect(result).toEqual({
        user: CREATED_USER,
        sessionId: SESSION_ID,
      });

      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should not create a user or session if email already exists', async () => {
      usersService.findByEmailForAuthentication.mockResolvedValue({
        id: 'existing-user-id',
        email: REGISTER_DTO.email,
      });

      await expect(authService.register(REGISTER_DTO)).rejects.toThrow(ConflictException);

      expect(passwordService.hash).not.toHaveBeenCalled();
      expect(usersService.createWithOrganization).not.toHaveBeenCalled();
      expect(sessionService.create).not.toHaveBeenCalled();
    });

    it('should not create a session if user creation fails', async () => {
      usersService.findByEmailForAuthentication.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('hashed-password');
      usersService.createWithOrganization.mockRejectedValue(new Error('Database error'));

      await expect(authService.register(REGISTER_DTO)).rejects.toThrow('Database error');

      expect(sessionService.create).not.toHaveBeenCalled();
    });
  });

  describe('validateCredentials', () => {
    const email = 'john@example.com';
    const password = 'password123';

    it('should return public user data if credentials are valid', async () => {
      const user = {
        id: 'user-id',
        email,
        name: 'John Doe',
        passwordHash: 'hashed-password',
      };

      usersService.findByEmailForAuthentication.mockResolvedValue(user);
      passwordService.verify.mockResolvedValue(true);

      const result = await authService.validateCredentials(email, password);

      expect(usersService.findByEmailForAuthentication).toHaveBeenCalledWith(email);
      expect(passwordService.verify).toHaveBeenCalledWith(user.passwordHash, password);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      usersService.findByEmailForAuthentication.mockResolvedValue(null);

      await expect(authService.validateCredentials(email, password)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(passwordService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      usersService.findByEmailForAuthentication.mockResolvedValue({
        id: 'user-id',
        email,
        name: 'John Doe',
        passwordHash: 'hashed-password',
      });

      passwordService.verify.mockResolvedValue(false);

      await expect(authService.validateCredentials(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    const email = 'john@example.com';
    const password = 'password123';

    it('should create a session and return user with session ID', async () => {
      const user = {
        id: 'user-id',
        email,
        name: 'John Doe',
      };

      const validateCredentialsMock = vi
        .spyOn(authService, 'validateCredentials')
        .mockResolvedValue(user);

      sessionService.create.mockResolvedValue(SESSION_ID);

      const result = await authService.login(email, password);

      expect(validateCredentialsMock).toHaveBeenCalledWith(email, password);
      expect(sessionService.create).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({ user, sessionId: SESSION_ID });
    });

    it('should not create a session if credentials are invalid', async () => {
      vi.spyOn(authService, 'validateCredentials').mockRejectedValue(new UnauthorizedException());

      await expect(authService.login(email, password)).rejects.toThrow(UnauthorizedException);

      expect(sessionService.create).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    const sessionId = 'session-id';

    const session = {
      userId: 'user-id',
      createdAt: new Date().toISOString(),
    };

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

    it('should throw UnauthorizedException if session ID is missing', async () => {
      await expect(authService.getCurrentUser()).rejects.toThrow(UnauthorizedException);

      expect(sessionService.find).not.toHaveBeenCalled();
      expect(usersService.findAuthenticatedUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if session does not exist', async () => {
      sessionService.find.mockResolvedValue(null);

      await expect(authService.getCurrentUser(sessionId)).rejects.toThrow(UnauthorizedException);

      expect(sessionService.find).toHaveBeenCalledWith(sessionId);
      expect(usersService.findAuthenticatedUser).not.toHaveBeenCalled();
    });

    it('should return the authenticated user with memberships if session is valid', async () => {
      sessionService.find.mockResolvedValue(session);
      usersService.findAuthenticatedUser.mockResolvedValue(user);

      const result = await authService.getCurrentUser(sessionId);

      expect(sessionService.find).toHaveBeenCalledWith(sessionId);
      expect(usersService.findAuthenticatedUser).toHaveBeenCalledWith(session.userId);
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if user associated with session does not exist', async () => {
      sessionService.find.mockResolvedValue(session);
      usersService.findAuthenticatedUser.mockResolvedValue(null);

      await expect(authService.getCurrentUser(sessionId)).rejects.toThrow(UnauthorizedException);

      expect(usersService.findAuthenticatedUser).toHaveBeenCalledWith(session.userId);
    });
  });

  describe('logout', () => {
    it('should destroy session if session ID is provided', async () => {
      await authService.logout(SESSION_ID);

      expect(sessionService.destroy).toHaveBeenCalledWith(SESSION_ID);
    });

    it('should not destroy session if session ID is missing', async () => {
      await authService.logout();

      expect(sessionService.destroy).not.toHaveBeenCalled();
    });

    it('should propagate errors from SessionService', async () => {
      sessionService.destroy.mockRejectedValue(new Error('Redis error'));

      await expect(authService.logout(SESSION_ID)).rejects.toThrow('Redis error');

      expect(sessionService.destroy).toHaveBeenCalledWith(SESSION_ID);
    });
  });
});
