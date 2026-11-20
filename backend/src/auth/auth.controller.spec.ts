import { Test } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SESSION_COOKIE_NAME, SESSION_TTL_MILLISECONDS } from './constants/session.constants.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const REGISTER_DTO: RegisterDto = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  organizationName: 'Acme Inc',
};

const REGISTERED_USER = {
  id: 'user-id',
  email: REGISTER_DTO.email,
  name: REGISTER_DTO.name,
  memberships: [
    {
      role: 'OWNER',
      organization: {
        id: 'organization-id',
        name: REGISTER_DTO.organizationName,
        slug: 'acme-inc',
      },
    },
  ],
};

const SESSION_ID = 'session-id';

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_MILLISECONDS,
};

describe('AuthController', () => {
  let authController: AuthController;

  const authService = {
    register: vi.fn(),
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(async () => {
    authService.register.mockReset();
    authService.login.mockReset();
    authService.getCurrentUser.mockReset();
    authService.logout.mockReset();

    const testingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    authController = testingModule.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should create session cookie and return user without session ID', async () => {
      const cookieMock = vi.fn();

      const response = {
        cookie: cookieMock,
      } as unknown as Response;

      authService.register.mockResolvedValue({
        user: REGISTERED_USER,
        sessionId: SESSION_ID,
      });

      const result = await authController.register(REGISTER_DTO, response);

      expect(authService.register).toHaveBeenCalledWith(REGISTER_DTO);

      expect(cookieMock).toHaveBeenCalledWith(
        SESSION_COOKIE_NAME,
        SESSION_ID,
        SESSION_COOKIE_OPTIONS,
      );

      expect(result).toEqual(REGISTERED_USER);
      expect(result).not.toHaveProperty('sessionId');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('should set session cookie and return user without session ID', async () => {
      const dto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const user = {
        id: 'user-id',
        email: dto.email,
        name: 'John Doe',
      };

      const cookieMock = vi.fn();

      const response = {
        cookie: cookieMock,
      } as unknown as Response;

      authService.login.mockResolvedValue({
        user,
        sessionId: SESSION_ID,
      });

      const result = await authController.login(dto, response);

      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);

      expect(cookieMock).toHaveBeenCalledWith(
        SESSION_COOKIE_NAME,
        SESSION_ID,
        SESSION_COOKIE_OPTIONS,
      );

      expect(result).toEqual(user);
      expect(result).not.toHaveProperty('sessionId');
    });
  });

  describe('getCurrentUser', () => {
    it('should call AuthService.getCurrentUser with session ID from cookie', async () => {
      const request = {
        cookies: {
          [SESSION_COOKIE_NAME]: SESSION_ID,
        },
      } as unknown as Request;

      const expectedUser = {
        id: 'user-id',
        email: 'john@example.com',
        name: 'John Doe',
      };

      authService.getCurrentUser.mockResolvedValue(expectedUser);

      const result = await authController.getCurrentUser(request);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(SESSION_ID);
      expect(result).toEqual(expectedUser);
    });

    it('should call AuthService.getCurrentUser with undefined if cookie is missing', async () => {
      const request = {
        cookies: {},
      } as unknown as Request;

      authService.getCurrentUser.mockResolvedValue(null);

      const result = await authController.getCurrentUser(request);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(undefined);
      expect(result).toBeNull();
    });

    it('should handle request without cookies', async () => {
      const request = {} as Request;

      authService.getCurrentUser.mockResolvedValue(null);

      const result = await authController.getCurrentUser(request);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(undefined);
      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should destroy session, clear cookie and return success', async () => {
      const request = {
        cookies: {
          [SESSION_COOKIE_NAME]: SESSION_ID,
        },
      } as unknown as Request;

      const clearCookieMock = vi.fn();

      const response = {
        clearCookie: clearCookieMock,
      } as unknown as Response;

      authService.logout.mockResolvedValue(undefined);

      const result = await authController.logout(request, response);

      expect(authService.logout).toHaveBeenCalledWith(SESSION_ID);

      expect(clearCookieMock).toHaveBeenCalledWith(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      expect(result).toEqual({ success: true });
    });

    it('should clear cookie even if session ID is missing', async () => {
      const request = {
        cookies: {},
      } as unknown as Request;

      const clearCookieMock = vi.fn();

      const response = {
        clearCookie: clearCookieMock,
      } as unknown as Response;

      authService.logout.mockResolvedValue(undefined);

      const result = await authController.logout(request, response);

      expect(authService.logout).toHaveBeenCalledWith(undefined);
      expect(clearCookieMock).toHaveBeenCalledWith(SESSION_COOKIE_NAME, expect.any(Object));
      expect(result).toEqual({ success: true });
    });

    it('should not clear cookie if session destruction fails', async () => {
      const request = {
        cookies: {
          [SESSION_COOKIE_NAME]: SESSION_ID,
        },
      } as unknown as Request;

      const clearCookieMock = vi.fn();

      const response = {
        clearCookie: clearCookieMock,
      } as unknown as Response;

      authService.logout.mockRejectedValue(new Error('Redis error'));

      await expect(authController.logout(request, response)).rejects.toThrow('Redis error');

      expect(clearCookieMock).not.toHaveBeenCalled();
    });
  });
});
