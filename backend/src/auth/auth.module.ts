import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module.js';
import { SecurityModule } from '../security/security.module.js';
import { RedisModule } from '../redis/redis.module.js';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [UsersModule, SecurityModule, RedisModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService],
  exports: [AuthService],
})
export class AuthModule {}
