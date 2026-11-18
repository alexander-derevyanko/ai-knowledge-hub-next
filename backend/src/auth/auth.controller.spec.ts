import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { RegisterDto } from './dto/register.dto.js';

describe('AuthController', () => {
  let authController: AuthController;

  const authService = {
    register: vi.fn(),
  };

  beforeEach(async () => {
    authService.register.mockReset();

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'StrongPassword123!',
      organizationName: 'My Knowledge Hub',
    };

    it('should call AuthService.register with the provided DTO', async () => {
      const expectedResult = {
        id: 'user-id',
        email: registerDto.email,
        name: registerDto.name,
      };

      authService.register.mockResolvedValue(expectedResult);

      const result = await authController.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
