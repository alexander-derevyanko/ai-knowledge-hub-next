import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module.js';
import { SecurityModule } from '../security/security.module.js';
import { RedisModule } from '../redis/redis.module.js';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { SessionService } from './session.service.js';
import { AuthGuard } from './guards/auth.guard.js';

@Module({
  imports: [UsersModule, SecurityModule, RedisModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
