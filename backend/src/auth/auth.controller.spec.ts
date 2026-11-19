import { Test } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SESSION_COOKIE_NAME, SESSION_TTL_MILLISECONDS } from './constants/session.constants.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

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
    it('should call AuthService.register with DTO', async () => {
      const dto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        organizationName: 'Acme Inc',
      };

      const expectedResult = {
        id: 'user-id',
        email: dto.email,
        name: dto.name,
      };

      authService.register.mockResolvedValue(expectedResult);

      const result = await authController.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
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
      const sessionId = 'session-id';

      const cookieMock = vi.fn();

      const response = {
        cookie: cookieMock,
      } as unknown as Response;

      authService.login.mockResolvedValue({ user, sessionId });

      const result = await authController.login(dto, response);

      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);

      expect(cookieMock).toHaveBeenCalledWith(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TTL_MILLISECONDS,
      });

      expect(result).toEqual(user);
      expect(result).not.toHaveProperty('sessionId');
    });
  });

  describe('getCurrentUser', () => {
    it('should call AuthService.getCurrentUser with session ID from cookie', async () => {
      const request = {
        cookies: {
          [SESSION_COOKIE_NAME]: 'session-id',
        },
      } as unknown as Request;

      const expectedUser = {
        id: 'user-id',
        email: 'john@example.com',
        name: 'John Doe',
      };

      authService.getCurrentUser.mockResolvedValue(expectedUser);

      const result = await authController.getCurrentUser(request);

      expect(authService.getCurrentUser).toHaveBeenCalledWith('session-id');
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
      const sessionId = 'session-id';

      const request = {
        cookies: {
          [SESSION_COOKIE_NAME]: sessionId,
        },
      } as unknown as Request;

      const clearCookieMock = vi.fn();

      const response = {
        clearCookie: clearCookieMock,
      } as unknown as Response;

      authService.logout.mockResolvedValue(undefined);

      const result = await authController.logout(request, response);

      expect(authService.logout).toHaveBeenCalledWith(sessionId);

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
          [SESSION_COOKIE_NAME]: 'session-id',
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
